import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risks:
 *   get:
 *     summary: Get all risks
 *     description: Retrieve a list of all legal risks with pagination and filtering
 *     tags:
 *       - Risk Management
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
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter by risk severity
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by risk status
 *     responses:
 *       200:
 *         description: List of risks retrieved successfully
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
 *                 total:
 *                   type: integer
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM legal_risks';
    let countQuery = 'SELECT COUNT(*) FROM legal_risks';
    const params = [];
    const conditions = [];
    
    if (severity) {
      conditions.push(`risk_severity = $${params.length + 1}`);
      params.push(severity);
    }
    
    if (status) {
      conditions.push(`risk_status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      queryText += whereClause;
      countQuery += whereClause;
    }
    
    queryText += ' ORDER BY identified_date DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(queryText, params);
    const countResult = await query(countQuery, severity || status ? params.slice(0, conditions.length) : []);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching risks:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risks:
 *   post:
 *     summary: Create a new risk
 *     description: Add a new legal risk to the system
 *     tags:
 *       - Risk Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - risk_id
 *               - risk_type
 *               - risk_description
 *               - identified_by
 *               - identified_date
 *               - risk_severity
 *               - risk_status
 *             properties:
 *               risk_id:
 *                 type: string
 *               risk_type:
 *                 type: string
 *               risk_description:
 *                 type: string
 *               identified_by:
 *                 type: string
 *               identified_date:
 *                 type: string
 *                 format: date-time
 *               risk_severity:
 *                 type: string
 *               mitigation_plan:
 *                 type: string
 *               review_date:
 *                 type: string
 *                 format: date-time
 *               risk_status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      risk_id,
      risk_type,
      risk_description,
      identified_by,
      identified_date,
      risk_severity,
      mitigation_plan,
      review_date,
      risk_status
    } = body;

    // Validation
    if (!risk_id || !risk_type || !risk_description || !identified_by || !identified_date || !risk_severity || !risk_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO legal_risks 
       (risk_id, risk_type, risk_description, identified_by, identified_date, risk_severity, mitigation_plan, review_date, risk_status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
       RETURNING *`,
      [risk_id, risk_type, risk_description, identified_by, identified_date, risk_severity, mitigation_plan, review_date, risk_status]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating risk:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}