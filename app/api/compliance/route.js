import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/compliance:
 *   get:
 *     summary: Get all legal compliance records
 *     description: Retrieve a list of all legal compliance checks with pagination and filtering
 *     tags:
 *       - Legal Compliance
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by compliance status
 *     responses:
 *       200:
 *         description: List of legal compliance records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM legal_compliance WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND compliance_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    queryText += ` ORDER BY compliance_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM legal_compliance WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND compliance_status = $1';
      countParams.push(status);
    }
    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching compliance records:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/compliance:
 *   post:
 *     summary: Create a new legal compliance record
 *     description: Create a new legal compliance check record
 *     tags:
 *       - Legal Compliance
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - compliance_id
 *               - regulation_name
 *               - entity_checked
 *               - compliance_date
 *               - compliance_status
 *               - responsible_officer
 *             properties:
 *               compliance_id:
 *                 type: string
 *               regulation_name:
 *                 type: string
 *               entity_checked:
 *                 type: string
 *               compliance_date:
 *                 type: string
 *                 format: date-time
 *               compliance_status:
 *                 type: string
 *               responsible_officer:
 *                 type: string
 *               action_required:
 *                 type: string
 *               next_review_date:
 *                 type: string
 *                 format: date-time
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Compliance record created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      compliance_id,
      regulation_name,
      entity_checked,
      compliance_date,
      compliance_status,
      responsible_officer,
      action_required,
      next_review_date,
      remarks
    } = body;

    // Validation
    if (!compliance_id || !regulation_name || !entity_checked || !compliance_date || !compliance_status || !responsible_officer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO legal_compliance (
        compliance_id, regulation_name, entity_checked, compliance_date,
        compliance_status, responsible_officer, action_required,
        next_review_date, remarks, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [compliance_id, regulation_name, entity_checked, compliance_date, compliance_status, responsible_officer, action_required || null, next_review_date || null, remarks || null]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}