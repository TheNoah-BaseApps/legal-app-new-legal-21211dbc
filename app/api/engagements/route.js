/**
 * @swagger
 * /api/engagements:
 *   get:
 *     summary: Get all engagements
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of engagements
 *   post:
 *     summary: Create a new engagement
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Engagement created
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { generateEngagementId } from '@/lib/utils';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = `
      SELECT e.*, cu.customer_name
      FROM engagements e
      LEFT JOIN customers cu ON e.client_id = cu.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      sql += ` AND (e.engagement_notes ILIKE $${paramCount} OR cu.customer_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY e.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get engagements error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagements' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      engagement_id,
      client_id,
      engagement_type,
      engagement_date,
      engagement_outcome,
      contact_person,
      recorded_by,
      engagement_channel,
      engagement_notes,
    } = body;

    const finalEngagementId = engagement_id || generateEngagementId();

    const result = await query(
      `INSERT INTO engagements (
        engagement_id, client_id, engagement_type, engagement_date,
        engagement_outcome, contact_person, recorded_by, engagement_channel,
        engagement_notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        finalEngagementId,
        client_id,
        engagement_type,
        engagement_date,
        engagement_outcome,
        contact_person,
        recorded_by,
        engagement_channel,
        engagement_notes || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create engagement error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create engagement' },
      { status: 500 }
    );
  }
}