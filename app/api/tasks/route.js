import { NextResponse } from 'next/server';
import { query } from '@/lib/database/aurora';

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all legal tasks
 *     description: Retrieve a list of all legal tasks with optional filtering
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: case_id
 *         schema:
 *           type: string
 *         description: Filter by related case ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by task status
 *       - in: query
 *         name: assigned_to
 *         schema:
 *           type: string
 *         description: Filter by assigned person
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority level
 *     responses:
 *       200:
 *         description: List of tasks retrieved successfully
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
    const assignedTo = searchParams.get('assigned_to');
    const priority = searchParams.get('priority');
    
    let sql = 'SELECT * FROM legal_tasks WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (caseId) {
      sql += ` AND related_case_id = $${paramIndex}`;
      params.push(caseId);
      paramIndex++;
    }
    
    if (status) {
      sql += ` AND task_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (assignedTo) {
      sql += ` AND assigned_to = $${paramIndex}`;
      params.push(assignedTo);
      paramIndex++;
    }
    
    if (priority) {
      sql += ` AND priority_level = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    sql += ' ORDER BY due_date ASC';
    
    const result = await query(sql, params);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new legal task
 *     description: Add a new task to the system
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task_title
 *               - assigned_to
 *               - due_date
 *               - task_status
 *               - priority_level
 *             properties:
 *               task_title:
 *                 type: string
 *               assigned_to:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date-time
 *               task_status:
 *                 type: string
 *               priority_level:
 *                 type: string
 *               related_case_id:
 *                 type: string
 *               task_description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      task_title,
      assigned_to,
      due_date,
      task_status,
      priority_level,
      related_case_id,
      task_description
    } = body;
    
    // Validation
    if (!task_title || !assigned_to || !due_date || !task_status || !priority_level) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await query(
      `INSERT INTO legal_tasks 
       (task_title, assigned_to, due_date, task_status, priority_level, related_case_id, created_date, task_description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), NOW())
       RETURNING *`,
      [task_title, assigned_to, due_date, task_status, priority_level, related_case_id || null, task_description || null]
    );
    
    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}