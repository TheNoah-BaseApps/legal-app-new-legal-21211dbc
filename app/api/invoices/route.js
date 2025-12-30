import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all legal invoices
 *     description: Retrieve a list of all legal invoices with pagination and filtering
 *     tags:
 *       - Legal Invoices
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
 *         description: Filter by invoice status
 *     responses:
 *       200:
 *         description: List of legal invoices
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

    let queryText = `
      SELECT 
        li.*,
        c.customer_name as client_name,
        cs.case_number,
        cs.case_title
      FROM legal_invoices li
      LEFT JOIN customers c ON li.client_id = c.id
      LEFT JOIN cases cs ON li.case_id = cs.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND li.invoice_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    queryText += ` ORDER BY li.invoice_date DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM legal_invoices WHERE 1=1';
    const countParams = [];
    if (status) {
      countQuery += ' AND invoice_status = $1';
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
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create a new legal invoice
 *     description: Create a new legal invoice record
 *     tags:
 *       - Legal Invoices
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoice_id
 *               - client_id
 *               - invoice_date
 *               - due_date
 *               - invoice_amount
 *               - tax_amount
 *               - invoice_status
 *             properties:
 *               invoice_id:
 *                 type: string
 *               client_id:
 *                 type: string
 *               case_id:
 *                 type: string
 *               invoice_date:
 *                 type: string
 *                 format: date-time
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               invoice_amount:
 *                 type: number
 *               tax_amount:
 *                 type: number
 *               invoice_status:
 *                 type: string
 *               payment_reference:
 *                 type: string
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      invoice_id,
      client_id,
      case_id,
      invoice_date,
      due_date,
      invoice_amount,
      tax_amount,
      invoice_status,
      payment_reference
    } = body;

    // Validation
    if (!invoice_id || !client_id || !invoice_date || !due_date || !invoice_amount || invoice_amount < 0 || !tax_amount || tax_amount < 0 || !invoice_status) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO legal_invoices (
        invoice_id, client_id, case_id, invoice_date, due_date,
        invoice_amount, tax_amount, invoice_status, payment_reference,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [invoice_id, client_id, case_id || null, invoice_date, due_date, invoice_amount, tax_amount, invoice_status, payment_reference || null]
    );

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}