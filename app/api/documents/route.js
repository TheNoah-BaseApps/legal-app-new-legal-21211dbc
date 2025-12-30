import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all legal documents
 *     description: Retrieve a list of all legal documents with optional filtering
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: string
 *         description: Filter by associated case ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by document status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by document type
 *     responses:
 *       200:
 *         description: List of documents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('case_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    let sql = 'SELECT * FROM legal_documents WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (caseId) {
      sql += ` AND associated_case_id = $${paramIndex}`;
      params.push(caseId);
      paramIndex++;
    }
    
    if (status) {
      sql += ` AND document_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (type) {
      sql += ` AND document_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    sql += ' ORDER BY upload_date DESC';
    
    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Create a new legal document
 *     description: Add a new document to the system
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - document_title
 *               - document_type
 *               - uploaded_by
 *               - storage_location
 *               - document_status
 *               - document_version
 *             properties:
 *               document_title:
 *                 type: string
 *               document_type:
 *                 type: string
 *               uploaded_by:
 *                 type: string
 *               associated_case_id:
 *                 type: string
 *               storage_location:
 *                 type: string
 *               document_status:
 *                 type: string
 *               document_version:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      document_title,
      document_type,
      uploaded_by,
      associated_case_id,
      storage_location,
      document_status,
      document_version
    } = body;
    
    // Validation
    if (!document_title || !document_type || !uploaded_by || !storage_location || !document_status || !document_version) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO legal_documents 
       (document_title, document_type, uploaded_by, upload_date, associated_case_id, storage_location, document_status, document_version, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [document_title, document_type, uploaded_by, associated_case_id || null, storage_location, document_status, document_version]
    );
    
    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}