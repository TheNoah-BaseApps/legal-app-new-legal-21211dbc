/**
 * @swagger
 * /api/cases:
 *   get:
 *     summary: Get all cases
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cases
 *   post:
 *     summary: Create a new case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Case created
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';
import { generateCaseId } from '@/lib/utils';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let sql = `
      SELECT c.*, cu.customer_name, cu.email_address as customer_email
      FROM cases c
      LEFT JOIN customers cu ON c.client_id = cu.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      sql += ` AND (c.case_title ILIKE $${paramCount} OR c.case_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY c.created_at DESC';

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
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
      case_id,
      case_title,
      client_id,
      case_type,
      case_status,
      assigned_attorney,
      filing_date,
      court_name,
      hearing_date,
    } = body;

    const finalCaseId = case_id || generateCaseId();

    const result = await query(
      `INSERT INTO cases (
        case_id, case_title, client_id, case_type, case_status,
        assigned_attorney, filing_date, court_name, hearing_date,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        finalCaseId,
        case_title,
        client_id,
        case_type,
        case_status,
        assigned_attorney,
        filing_date,
        court_name,
        hearing_date || null,
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
    console.error('Create case error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create case' },
      { status: 500 }
    );
  }
}