import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/risks/{id}:
 *   get:
 *     summary: Get risk by ID
 *     description: Retrieve a specific risk by its ID
 *     tags:
 *       - Risk Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Risk ID
 *     responses:
 *       200:
 *         description: Risk retrieved successfully
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const result = await query('SELECT * FROM legal_risks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching risk:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risks/{id}:
 *   put:
 *     summary: Update risk
 *     description: Update an existing risk
 *     tags:
 *       - Risk Management
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
 *               risk_type:
 *                 type: string
 *               risk_description:
 *                 type: string
 *               risk_severity:
 *                 type: string
 *               mitigation_plan:
 *                 type: string
 *               review_date:
 *                 type: string
 *               risk_status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Risk updated successfully
 *       404:
 *         description: Risk not found
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
      `UPDATE legal_risks SET ${updates.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating risk:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/risks/{id}:
 *   delete:
 *     summary: Delete risk
 *     description: Delete a risk by ID
 *     tags:
 *       - Risk Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Risk deleted successfully
 *       404:
 *         description: Risk not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await query('DELETE FROM legal_risks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Risk not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Risk deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}