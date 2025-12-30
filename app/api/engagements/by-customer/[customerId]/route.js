/**
 * @swagger
 * /api/engagements/by-customer/{customerId}:
 *   get:
 *     summary: Get all engagements for a specific customer
 *     tags: [Engagements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of engagements for customer
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
      `SELECT * FROM engagements WHERE client_id = $1 ORDER BY created_at DESC`,
      [params.customerId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get customer engagements error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch engagements' },
      { status: 500 }
    );
  }
}