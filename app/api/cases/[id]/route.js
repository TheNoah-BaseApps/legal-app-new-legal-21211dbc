/**
 * @swagger
 * /api/cases/{id}:
 *   get:
 *     summary: Get case by ID
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Case details
 *   put:
 *     summary: Update case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Case updated
 *   delete:
 *     summary: Delete case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Case deleted
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT c.*, cu.customer_name, cu.email_address as customer_email
       FROM cases c
       LEFT JOIN customers cu ON c.client_id = cu.id
       WHERE c.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch case' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      case_title,
      client_id,
      case_type,
      case_status,
      assigned_attorney,
      filing_date,
      court_name,
      hearing_date,
    } = body;

    const result = await query(
      `UPDATE cases SET
        case_title = $1, client_id = $2, case_type = $3, case_status = $4,
        assigned_attorney = $5, filing_date = $6, court_name = $7,
        hearing_date = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        case_title,
        client_id,
        case_type,
        case_status,
        assigned_attorney,
        filing_date,
        court_name,
        hearing_date || null,
        params.id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update case' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query('DELETE FROM cases WHERE id = $1 RETURNING id', [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Case not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Case deleted successfully',
    });
  } catch (error) {
    console.error('Delete case error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete case' },
      { status: 500 }
    );
  }
}