/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Export data in various formats
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Type of data to export (customers, cases, engagements, all)
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *         description: Export format (csv, json)
 *     responses:
 *       200:
 *         description: Exported data
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'customers';
    const format = searchParams.get('format') || 'csv';

    let data = [];
    let filename = '';

    switch (type) {
      case 'customers':
        const customersResult = await query('SELECT * FROM customers ORDER BY created_at DESC');
        data = customersResult.rows;
        filename = `customers_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'cases':
        const casesResult = await query(`
          SELECT c.*, cu.customer_name
          FROM cases c
          LEFT JOIN customers cu ON c.client_id = cu.id
          ORDER BY c.created_at DESC
        `);
        data = casesResult.rows;
        filename = `cases_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'engagements':
        const engagementsResult = await query(`
          SELECT e.*, cu.customer_name
          FROM engagements e
          LEFT JOIN customers cu ON e.client_id = cu.id
          ORDER BY e.created_at DESC
        `);
        data = engagementsResult.rows;
        filename = `engagements_export_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'all':
        const [customersAll, casesAll, engagementsAll] = await Promise.all([
          query('SELECT * FROM customers ORDER BY created_at DESC'),
          query('SELECT * FROM cases ORDER BY created_at DESC'),
          query('SELECT * FROM engagements ORDER BY created_at DESC'),
        ]);
        data = {
          customers: customersAll.rows,
          cases: casesAll.rows,
          engagements: engagementsAll.rows,
        };
        filename = `all_data_export_${new Date().toISOString().split('T')[0]}`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid export type' },
          { status: 400 }
        );
    }

    if (format === 'json') {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      });
    } else if (format === 'csv') {
      let csv = '';
      
      if (type === 'all') {
        csv = 'Export type "all" is only available in JSON format';
      } else if (data.length > 0) {
        const headers = Object.keys(data[0]);
        csv = headers.join(',') + '\n';
        
        data.forEach((row) => {
          const values = headers.map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
          });
          csv += values.join(',') + '\n';
        });
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}