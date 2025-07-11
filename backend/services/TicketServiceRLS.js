import { query, queryWithoutRLS } from '../db/index.js';
import { TICKET_STATUS } from '../constants/index.js';

export class TicketServiceRLS {
  constructor() {
    this.statuses = Object.values(TICKET_STATUS);
  }

  async findAll(filters = {}, userId) {
    const { status, organisation_id, user_id, page = 1, limit = 10 } = filters;
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (status) {
      whereConditions.push(`t.status = $${paramIndex++}`);
      params.push(status);
    }
    
    if (user_id) {
      whereConditions.push(`t.user_id = $${paramIndex++}`);
      params.push(user_id);
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Count query
    const countQuery = `
      SELECT COUNT(*) 
      FROM tickets t 
      ${whereClause}
    `;
    
    // Main query with RLS
    const mainQuery = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.user_id,
        t.organisation_id,
        t.created_at,
        t.updated_at,
        u.name as user_name,
        u.email as user_email,
        o.name as organisation_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN organisation o ON t.organisation_id = o.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    // Execute queries with RLS
    const [countResult, ticketsResult] = await Promise.all([
      query(countQuery, params, userId),
      query(mainQuery, params, userId)
    ]);
    
    const total = parseInt(countResult.rows[0].count);
    const tickets = ticketsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      userId: row.user_id,
      organisationId: row.organisation_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: row.user_name ? {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      } : null,
      organisation: row.organisation_name ? {
        id: row.organisation_id,
        name: row.organisation_name
      } : null
    }));
    
    return {
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id, userId) {
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.user_id,
        t.organisation_id,
        t.created_at,
        t.updated_at,
        u.name as user_name,
        u.email as user_email,
        o.name as organisation_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN organisation o ON t.organisation_id = o.id
      WHERE t.id = $1
    `;
    
    const result = await query(query, [id], userId);
    
    if (result.rows.length === 0) {
      throw new Error('Ticket not found');
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      userId: row.user_id,
      organisationId: row.organisation_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: row.user_name ? {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email
      } : null,
      organisation: row.organisation_name ? {
        id: row.organisation_id,
        name: row.organisation_name
      } : null
    };
  }

  async create(ticketData, userId) {
    const { title, description, status, user_id, organisation_id } = ticketData;
    
    // Validate status
    if (status && !this.statuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${this.statuses.join(', ')}`);
    }
    
    // Verify user and organisation exist (without RLS for validation)
    const [userResult, orgResult] = await Promise.all([
      queryWithoutRLS('SELECT id, organisation_id FROM users WHERE id = $1', [user_id]),
      queryWithoutRLS('SELECT id FROM organisation WHERE id = $1', [organisation_id])
    ]);
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    if (orgResult.rows.length === 0) {
      throw new Error('Organisation not found');
    }
    
    // Verify user belongs to the organisation
    if (userResult.rows[0].organisation_id !== organisation_id) {
      throw new Error('User does not belong to the specified organisation');
    }
    
    const insertQuery = `
      INSERT INTO tickets (title, description, status, user_id, organisation_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const result = await query(insertQuery, [
      title,
      description,
      status || TICKET_STATUS.OPEN,
      user_id,
      organisation_id
    ], userId);
    
    // Return the created ticket
    return await this.findById(result.rows[0].id, userId);
  }

  async update(id, updateData, userId) {
    const { title, description, status } = updateData;
    
    // Validate status if provided
    if (status && !this.statuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${this.statuses.join(', ')}`);
    }
    
    let updateFields = [];
    let params = [];
    let paramIndex = 1;
    
    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      params.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    
    if (status !== undefined) {
      updateFields.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }
    
    params.push(id);
    
    const updateQuery = `
      UPDATE tickets 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id
    `;
    
    const result = await query(updateQuery, params, userId);
    
    if (result.rows.length === 0) {
      throw new Error('Ticket not found');
    }
    
    // Return the updated ticket
    return await this.findById(id, userId);
  }

  async delete(id, userId) {
    const deleteQuery = 'DELETE FROM tickets WHERE id = $1 RETURNING id';
    const result = await query(deleteQuery, [id], userId);
    
    if (result.rows.length === 0) {
      throw new Error('Ticket not found');
    }
    
    return true;
  }

  async getTicketStats(userId) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM tickets
      GROUP BY status
      ORDER BY status
    `;
    
    const result = await query(query, [], userId);
    return result.rows;
  }
} 