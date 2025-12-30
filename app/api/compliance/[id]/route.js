import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/compliance/{id}:
 *   get:
 *     summary: Get a specific legal compliance record
 *     description: Retrieve details of a specific legal compliance check by ID
 *     tags:
 *       - Legal Compliance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Compliance record ID
 *     responses:
 *       200:
 *         description: Compliance record details
 *       404:
 *         description: Compliance record not found
 *       500:
 *         description: Server error
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'SELECT * FROM legal_compliance WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/compliance/{id}:
 *   put:
 *     summary: Update a legal compliance record
 *     description: Update an existing legal compliance check
 *     tags:
 *       - Legal Compliance
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
 *         description: Compliance record updated successfully
 *       404:
 *         description: Compliance record not found
 *       500:
 *         description: Server error
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const {
      compliance_id,
      regulation_name,
      entity_checked,
      compliance_date,
      compliance_status,
      responsible_officer,
      action_required,
      next_review_date,
      remarks
    } = body;

    const result = await query(
      `UPDATE legal_compliance SET
        compliance_id = COALESCE($1, compliance_id),
        regulation_name = COALESCE($2, regulation_name),
        entity_checked = COALESCE($3, entity_checked),
        compliance_date = COALESCE($4, compliance_date),
        compliance_status = COALESCE($5, compliance_status),
        responsible_officer = COALESCE($6, responsible_officer),
        action_required = $7,
        next_review_date = $8,
        remarks = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *`,
      [compliance_id, regulation_name, entity_checked, compliance_date, compliance_status, responsible_officer, action_required, next_review_date, remarks, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/compliance/{id}:
 *   delete:
 *     summary: Delete a legal compliance record
 *     description: Delete a legal compliance check by ID
 *     tags:
 *       - Legal Compliance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compliance record deleted successfully
 *       404:
 *         description: Compliance record not found
 *       500:
 *         description: Server error
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      'DELETE FROM legal_compliance WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Compliance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Compliance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting compliance record:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}