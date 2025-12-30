import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: Retrieve a specific transaction by its ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM legal_transactions WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update transaction
 *     description: Update an existing transaction
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Transaction updated successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  const client = await getClient();
  
  try {
    const { id } = params;
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

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE legal_transactions SET
        transaction_id = COALESCE($1, transaction_id),
        transaction_type = COALESCE($2, transaction_type),
        client_id = COALESCE($3, client_id),
        transaction_date = COALESCE($4, transaction_date),
        transaction_value = COALESCE($5, transaction_value),
        legal_advisor = COALESCE($6, legal_advisor),
        related_contract_id = COALESCE($7, related_contract_id),
        approval_status = COALESCE($8, approval_status),
        closing_date = COALESCE($9, closing_date),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [
        transaction_id,
        transaction_type,
        client_id,
        transaction_date,
        transaction_value,
        legal_advisor,
        related_contract_id,
        approval_status,
        closing_date,
        id
      ]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction
 *     description: Delete a transaction by ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  const client = await getClient();
  
  try {
    const { id } = params;

    await client.query('BEGIN');

    const result = await client.query(
      'DELETE FROM legal_transactions WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}