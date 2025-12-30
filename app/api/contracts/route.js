import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get all contracts
 *     description: Retrieve a list of all legal contracts with pagination and filtering
 *     tags:
 *       - Contracts
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
 *         description: Filter by contract status
 *     responses:
 *       200:
 *         description: List of contracts retrieved successfully
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
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    let queryText = 'SELECT * FROM legal_contracts';
    let countQuery = 'SELECT COUNT(*) FROM legal_contracts';
    const params = [];
    
    if (status) {
      queryText += ' WHERE contract_status = $1';
      countQuery += ' WHERE contract_status = $1';
      params.push(status);
    }
    
    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(queryText, params);
    const countResult = await query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contracts:
 *   post:
 *     summary: Create a new contract
 *     description: Add a new legal contract to the system
 *     tags:
 *       - Contracts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contract_id
 *               - contract_title
 *               - client_id
 *               - start_date
 *               - end_date
 *               - contract_value
 *               - contract_status
 *               - signed_by
 *             properties:
 *               contract_id:
 *                 type: string
 *               contract_title:
 *                 type: string
 *               client_id:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               contract_value:
 *                 type: number
 *               contract_status:
 *                 type: string
 *               signed_by:
 *                 type: string
 *               renewal_terms:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contract created successfully
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      contract_id,
      contract_title,
      client_id,
      start_date,
      end_date,
      contract_value,
      contract_status,
      signed_by,
      renewal_terms
    } = body;

    // Validation
    if (!contract_id || !contract_title || !client_id || !start_date || !end_date || !contract_value || !contract_status || !signed_by) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO legal_contracts 
       (contract_id, contract_title, client_id, start_date, end_date, contract_value, contract_status, signed_by, renewal_terms, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
       RETURNING *`,
      [contract_id, contract_title, client_id, start_date, end_date, contract_value, contract_status, signed_by, renewal_terms]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}