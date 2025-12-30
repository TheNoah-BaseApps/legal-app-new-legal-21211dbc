import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/matters:
 *   get:
 *     summary: Get all legal matters
 *     description: Retrieve a list of all legal matters with pagination support
 *     tags: [Matters]
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
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by matter status
 *     responses:
 *       200:
 *         description: List of matters retrieved successfully
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM legal_matters';
    let params = [];
    
    if (status) {
      queryText += ' WHERE matter_status = $1';
      params.push(status);
      queryText += ' ORDER BY open_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY open_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    const countResult = await query(
      status 
        ? 'SELECT COUNT(*) FROM legal_matters WHERE matter_status = $1' 
        : 'SELECT COUNT(*) FROM legal_matters',
      status ? [status] : []
    );
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
    console.error('Error fetching matters:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/matters:
 *   post:
 *     summary: Create a new matter
 *     description: Create a new legal matter record
 *     tags: [Matters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - matter_id
 *               - matter_title
 *               - matter_type
 *               - client_id
 *               - attorney_assigned
 *               - open_date
 *               - matter_status
 *               - jurisdiction
 *             properties:
 *               matter_id:
 *                 type: string
 *               matter_title:
 *                 type: string
 *               matter_description:
 *                 type: string
 *               matter_type:
 *                 type: string
 *               client_id:
 *                 type: string
 *                 format: uuid
 *               attorney_assigned:
 *                 type: string
 *               open_date:
 *                 type: string
 *                 format: date-time
 *               matter_status:
 *                 type: string
 *               jurisdiction:
 *                 type: string
 *               opposing_party:
 *                 type: string
 *               key_deadlines:
 *                 type: string
 *               amount_billed:
 *                 type: number
 *               matter_outcome:
 *                 type: string
 *     responses:
 *       201:
 *         description: Matter created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  const client = await getClient();
  
  try {
    const body = await request.json();
    const {
      matter_id,
      matter_title,
      matter_description,
      matter_type,
      client_id,
      attorney_assigned,
      open_date,
      matter_status,
      jurisdiction,
      opposing_party,
      key_deadlines,
      amount_billed,
      matter_outcome
    } = body;

    // Validation
    if (!matter_id || !matter_title || !matter_type || !client_id || 
        !attorney_assigned || !open_date || !matter_status || !jurisdiction) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO legal_matters (
        matter_id, matter_title, matter_description, matter_type, client_id,
        attorney_assigned, open_date, matter_status, jurisdiction, opposing_party,
        key_deadlines, amount_billed, matter_outcome, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *`,
      [
        matter_id,
        matter_title,
        matter_description || null,
        matter_type,
        client_id,
        attorney_assigned,
        open_date,
        matter_status,
        jurisdiction,
        opposing_party || null,
        key_deadlines || null,
        amount_billed || null,
        matter_outcome || null
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating matter:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}