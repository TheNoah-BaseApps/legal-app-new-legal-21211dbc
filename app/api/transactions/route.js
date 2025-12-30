import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all legal transactions
 *     description: Retrieve a list of all legal transactions with pagination support
 *     tags: [Transactions]
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
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
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

    let queryText = 'SELECT * FROM legal_transactions';
    let params = [];
    
    if (status) {
      queryText += ' WHERE approval_status = $1';
      params.push(status);
      queryText += ' ORDER BY transaction_date DESC LIMIT $2 OFFSET $3';
      params.push(limit, offset);
    } else {
      queryText += ' ORDER BY transaction_date DESC LIMIT $1 OFFSET $2';
      params = [limit, offset];
    }

    const result = await query(queryText, params);
    
    const countResult = await query(
      status 
        ? 'SELECT COUNT(*) FROM legal_transactions WHERE approval_status = $1' 
        : 'SELECT COUNT(*) FROM legal_transactions',
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
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     description: Create a new legal transaction record
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transaction_id
 *               - transaction_type
 *               - client_id
 *               - transaction_date
 *               - transaction_value
 *               - legal_advisor
 *               - approval_status
 *             properties:
 *               transaction_id:
 *                 type: string
 *               transaction_type:
 *                 type: string
 *               client_id:
 *                 type: string
 *                 format: uuid
 *               transaction_date:
 *                 type: string
 *                 format: date-time
 *               transaction_value:
 *                 type: number
 *               legal_advisor:
 *                 type: string
 *               related_contract_id:
 *                 type: string
 *                 format: uuid
 *               approval_status:
 *                 type: string
 *               closing_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Transaction created successfully
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
      transaction_id,
      transaction_type,
      client_id,
      transaction_date,
      transaction_value,
      legal_advisor,
      related_contract_id,
      approval_status,
      closing_date
    } = body;

    // Validation
    if (!transaction_id || !transaction_type || !client_id || !transaction_date || 
        !transaction_value || !legal_advisor || !approval_status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO legal_transactions (
        transaction_id, transaction_type, client_id, transaction_date,
        transaction_value, legal_advisor, related_contract_id, approval_status,
        closing_date, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        transaction_id,
        transaction_type,
        client_id,
        transaction_date,
        transaction_value,
        legal_advisor,
        related_contract_id || null,
        approval_status,
        closing_date || null
      ]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}