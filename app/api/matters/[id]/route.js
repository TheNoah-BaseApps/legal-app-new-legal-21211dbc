import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/matters/{id}:
 *   get:
 *     summary: Get matter by ID
 *     description: Retrieve a specific matter by its ID
 *     tags: [Matters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Matter retrieved successfully
 *       404:
 *         description: Matter not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query(
      'SELECT * FROM legal_matters WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Matter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching matter:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/matters/{id}:
 *   put:
 *     summary: Update matter
 *     description: Update an existing matter
 *     tags: [Matters]
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
 *         description: Matter updated successfully
 *       404:
 *         description: Matter not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  const client = await getClient();
  
  try {
    const { id } = params;
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

    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE legal_matters SET
        matter_id = COALESCE($1, matter_id),
        matter_title = COALESCE($2, matter_title),
        matter_description = COALESCE($3, matter_description),
        matter_type = COALESCE($4, matter_type),
        client_id = COALESCE($5, client_id),
        attorney_assigned = COALESCE($6, attorney_assigned),
        open_date = COALESCE($7, open_date),
        matter_status = COALESCE($8, matter_status),
        jurisdiction = COALESCE($9, jurisdiction),
        opposing_party = COALESCE($10, opposing_party),
        key_deadlines = COALESCE($11, key_deadlines),
        amount_billed = COALESCE($12, amount_billed),
        matter_outcome = COALESCE($13, matter_outcome),
        updated_at = NOW()
      WHERE id = $14
      RETURNING *`,
      [
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
        matter_outcome,
        id
      ]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Matter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating matter:', error);
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
 * /api/matters/{id}:
 *   delete:
 *     summary: Delete matter
 *     description: Delete a matter by ID
 *     tags: [Matters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Matter deleted successfully
 *       404:
 *         description: Matter not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  const client = await getClient();
  
  try {
    const { id } = params;

    await client.query('BEGIN');

    const result = await client.query(
      'DELETE FROM legal_matters WHERE id = $1 RETURNING *',
      [id]
    );

    await client.query('COMMIT');

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Matter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Matter deleted successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting matter:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}