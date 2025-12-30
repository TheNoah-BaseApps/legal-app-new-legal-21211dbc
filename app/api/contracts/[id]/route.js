import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get contract by ID
 *     description: Retrieve a specific contract by its ID
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contract ID
 *     responses:
 *       200:
 *         description: Contract retrieved successfully
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM legal_contracts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contracts/{id}:
 *   put:
 *     summary: Update contract
 *     description: Update an existing contract
 *     tags:
 *       - Contracts
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
 *             properties:
 *               contract_title:
 *                 type: string
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *               contract_value:
 *                 type: number
 *               contract_status:
 *                 type: string
 *               signed_by:
 *                 type: string
 *               renewal_terms:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contract updated successfully
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id') {
        updates.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    values.push(id);

    const result = await query(
      `UPDATE legal_contracts SET ${updates.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/contracts/{id}:
 *   delete:
 *     summary: Delete contract
 *     description: Delete a contract by ID
 *     tags:
 *       - Contracts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract deleted successfully
 *       404:
 *         description: Contract not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM legal_contracts WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}