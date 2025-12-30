/**
 * @swagger
 * /api/engagements/{id}:
 *   get:
 *     summary: Get engagement by ID
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement details
 *   put:
 *     summary: Update engagement
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement updated
 *   delete:
 *     summary: Delete engagement
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Engagement deleted
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
      `SELECT e.*, cu.customer_name
       FROM engagements e
       LEFT JOIN customers cu ON e.client_id = cu.id
       WHERE e.id = $1`,
      [params.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Get engagement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagement' },
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
      client_id,
      engagement_type,
      engagement_date,
      engagement_outcome,
      contact_person,
      recorded_by,
      engagement_channel,
      engagement_notes,
    } = body;

    const result = await query(
      `UPDATE engagements SET
        client_id = $1, engagement_type = $2, engagement_date = $3,
        engagement_outcome = $4, contact_person = $5, recorded_by = $6,
        engagement_channel = $7, engagement_notes = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *`,
      [
        client_id,
        engagement_type,
        engagement_date,
        engagement_outcome,
        contact_person,
        recorded_by,
        engagement_channel,
        engagement_notes || null,
        params.id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Update engagement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update engagement' },
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

    const result = await query('DELETE FROM engagements WHERE id = $1 RETURNING id', [params.id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Engagement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Engagement deleted successfully',
    });
  } catch (error) {
    console.error('Delete engagement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete engagement' },
      { status: 500 }
    );
  }
}