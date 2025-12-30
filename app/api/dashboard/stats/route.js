/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */

import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [
      customersResult,
      casesResult,
      engagementsResult,
      casesByStatusResult,
      customersByStatusResult,
    ] = await Promise.all([
      query('SELECT COUNT(*) as count FROM customers'),
      query("SELECT COUNT(*) as count FROM cases WHERE case_status IN ('Open', 'In Progress')"),
      query('SELECT COUNT(*) as count FROM engagements WHERE engagement_date >= CURRENT_DATE - INTERVAL \'30 days\''),
      query('SELECT case_status as status, COUNT(*) as count FROM cases GROUP BY case_status'),
      query('SELECT customer_status as status, COUNT(*) as count FROM customers GROUP BY customer_status'),
    ]);

    const totalCustomers = parseInt(customersResult.rows[0].count);
    const activeCases = parseInt(casesResult.rows[0].count);
    const recentEngagements = parseInt(engagementsResult.rows[0].count);

    const totalCasesResult = await query('SELECT COUNT(*) as count FROM cases');
    const totalCases = parseInt(totalCasesResult.rows[0].count);
    const closedCasesResult = await query("SELECT COUNT(*) as count FROM cases WHERE case_status IN ('Closed', 'Settled')");
    const closedCases = parseInt(closedCasesResult.rows[0].count);
    const completionRate = totalCases > 0 ? Math.round((closedCases / totalCases) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        activeCases,
        recentEngagements,
        completionRate,
        customerTrend: 5,
        caseTrend: 3,
        engagementTrend: 8,
        completionTrend: 2,
        casesByStatus: casesByStatusResult.rows,
        customersByStatus: customersByStatusResult.rows,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}