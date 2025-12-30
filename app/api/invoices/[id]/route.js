import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get a specific legal invoice
 *     description: Retrieve details of a specific legal invoice by ID
 *     tags:
 *       - Legal Invoices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT 
        li.*,
        c.customer_name as client_name,
        c.email as client_email,
        cs.case_number,
        cs.case_title
      FROM legal_invoices li
      LEFT JOIN customers c ON li.client_id = c.id
      LEFT JOIN cases cs ON li.case_id = cs.id
      WHERE li.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoices/{id}:
 *   put:
 *     summary: Update a legal invoice
 *     description: Update an existing legal invoice
 *     tags:
 *       - Legal Invoices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const result = await query(
      `UPDATE legal_invoices SET
        invoice_id = COALESCE($1, invoice_id),
        client_id = COALESCE($2, client_id),
        case_id = $3,
        invoice_date = COALESCE($4, invoice_date),
        due_date = COALESCE($5, due_date),
        invoice_amount = COALESCE($6, invoice_amount),
        tax_amount = COALESCE($7, tax_amount),
        invoice_status = COALESCE($8, invoice_status),
        payment_reference = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [invoice_id, client_id, case_id, invoice_date, due_date, invoice_amount, tax_amount, invoice_status, payment_reference, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     summary: Delete a legal invoice
 *     description: Delete a legal invoice by ID
 *     tags:
 *       - Legal Invoices
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM legal_invoices WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}