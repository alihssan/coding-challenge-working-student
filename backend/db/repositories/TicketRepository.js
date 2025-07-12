import { Repository } from "typeorm";
import { Ticket } from "../entities/Ticket.js";

export class TicketRepository extends Repository {
  constructor(dataSource) {
    super(Ticket, dataSource.createEntityManager());
  }

  // Set current user ID for RLS
  async setCurrentUser(userId) {
    console.log(`Setting current user ID for RLS: ${userId}`);
    
    // Use a more robust approach to set the user ID
    await this.query('SELECT set_current_user_id($1)', [userId]);
    
    // Verify the user ID was set correctly
    const result = await this.query('SELECT current_setting(\'app.current_user_id\', true) as current_user_id');
    const currentUserId = result[0]?.current_user_id;
    
    console.log(`RLS user ID verification: expected ${userId}, got ${currentUserId}`);
    
    if (currentUserId !== userId.toString()) {
      console.warn(`RLS user ID mismatch: expected ${userId}, got ${currentUserId}`);
    }
  }

  // Find all tickets with RLS applied
  async findAllWithRLS(filters = {}, userId) {
    // Set current user for RLS
    await this.setCurrentUser(userId);
    
    // Build the query with RLS applied
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    // Apply filters
    if (filters.status) {
      whereConditions.push(`ticket.status = $${paramIndex++}`);
      params.push(filters.status);
    }
    
    if (filters.user_id) {
      whereConditions.push(`ticket.user_id = $${paramIndex++}`);
      params.push(filters.user_id);
    }
    
    if (filters.organisation_id) {
      whereConditions.push(`ticket.organisation_id = $${paramIndex++}`);
      params.push(filters.organisation_id);
    }
    
    // Add search functionality
    if (filters.search) {
      whereConditions.push(`(ticket.title ILIKE $${paramIndex++} OR ticket.description ILIKE $${paramIndex++})`);
      params.push(`%${filters.search}%`);
      params.push(`%${filters.search}%`);
    }
    
    // Add date range filtering
    if (filters.created_after) {
      whereConditions.push(`ticket.created_at >= $${paramIndex++}`);
      params.push(new Date(filters.created_after));
    }
    
    if (filters.created_before) {
      whereConditions.push(`ticket.created_at <= $${paramIndex++}`);
      params.push(new Date(filters.created_before));
    }
    
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';
    
    // Add pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Count query with RLS (no pagination parameters)
    const countQuery = `
      SELECT COUNT(*) 
      FROM tickets ticket 
      LEFT JOIN users u ON ticket.user_id = u.id
      LEFT JOIN organisation o ON ticket.organisation_id = o.id
      ${whereClause}
    `;
    
    // Main query with RLS (includes pagination parameters)
    const mainQuery = `
      SELECT 
        ticket.id,
        ticket.title,
        ticket.description,
        ticket.status,
        ticket.user_id as "userId",
        ticket.organisation_id as "organisationId",
        ticket.created_at as "createdAt",
        ticket.updated_at as "updatedAt",
        u.id as "user.id",
        u.name as "user.name",
        u.email as "user.email",
        u.role as "user.role",
        u.organisation_id as "user.organisationId",
        u.created_at as "user.createdAt",
        u.updated_at as "user.updatedAt",
        o.id as "organisation.id",
        o.name as "organisation.name",
        o.created_at as "organisation.createdAt",
        o.updated_at as "organisation.updatedAt"
      FROM tickets ticket
      LEFT JOIN users u ON ticket.user_id = u.id
      LEFT JOIN organisation o ON ticket.organisation_id = o.id
      ${whereClause}
      ORDER BY ticket.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    // Add pagination parameters to the main query params
    const mainQueryParams = [...params, limit, offset];
    
    // Execute queries with RLS in a transaction to ensure same connection
    const queryRunner = this.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
         try {
       console.log(`Starting RLS transaction for user ${userId}`);
       
       // Set current user for RLS on this connection
       await queryRunner.query('SELECT set_current_user_id($1)', [userId]);
       console.log(`Set current user ID for RLS: ${userId}`);
       
       // Verify the user ID was set correctly
       const verifyResult = await queryRunner.query('SELECT current_setting(\'app.current_user_id\', true) as current_user_id');
       const currentUserId = verifyResult[0]?.current_user_id;
       console.log(`RLS user ID verification: expected ${userId}, got ${currentUserId}`);
      
             // Execute queries with RLS
       console.log(`Executing count query with RLS...`);
       const countResult = await queryRunner.query(countQuery, params);
       console.log(`Count result: ${countResult[0].count} tickets`);
       
       console.log(`Executing main query with RLS...`);
       const ticketsResult = await queryRunner.query(mainQuery, mainQueryParams);
       console.log(`Main query result: ${ticketsResult.length} tickets`);
      
      await queryRunner.commitTransaction();
      
      const total = parseInt(countResult[0].count);
      
      // Transform the raw results to match TypeORM entity structure
      const tickets = ticketsResult.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        userId: row.userId,
        organisationId: row.organisationId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: {
          id: row['user.id'],
          name: row['user.name'],
          email: row['user.email'],
          role: row['user.role'],
          organisationId: row['user.organisationId'],
          createdAt: row['user.createdAt'],
          updatedAt: row['user.updatedAt']
        },
        organisation: {
          id: row['organisation.id'],
          name: row['organisation.name'],
          createdAt: row['organisation.createdAt'],
          updatedAt: row['organisation.updatedAt']
        }
      }));
      
      return {
        tickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
         } finally {
       await queryRunner.release();
     }
  }

  // Find ticket by ID with RLS
  async findByIdWithRLS(id, userId) {
    await this.setCurrentUser(userId);
    
    const ticket = await this.findOne({
      where: { id: parseInt(id) },
      relations: ['user', 'organisation']
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  }

  // Create ticket with RLS validation
  async createWithRLS(ticketData, userId) {
    await this.setCurrentUser(userId);
    
    const ticket = this.create(ticketData);
    const savedTicket = await this.save(ticket);
    
    // Return the created ticket
    return await this.findOne({
      where: { id: savedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  // Update ticket with RLS
  async updateWithRLS(id, updateData, userId) {
    await this.setCurrentUser(userId);
    
    const ticket = await this.findOne({ 
      where: { id: parseInt(id) }
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        ticket[key] = updateData[key];
      }
    });
    
    ticket.updatedAt = new Date();
    const updatedTicket = await this.save(ticket);
    
    // Return the updated ticket
    return await this.findOne({
      where: { id: updatedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  // Delete ticket with RLS
  async deleteWithRLS(id, userId) {
    await this.setCurrentUser(userId);
    
    const ticket = await this.findOne({ 
      where: { id: parseInt(id) }
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    await this.remove(ticket);
    return true;
  }

  // Get ticket stats with RLS
  async getStatsWithRLS(userId) {
    await this.setCurrentUser(userId);
    
    const stats = await this.createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany();
    
    // Get total count
    const totalResult = await this.createQueryBuilder('ticket')
      .select('COUNT(*)', 'total')
      .getRawOne();
    
    return {
      stats,
      total: parseInt(totalResult.total)
    };
  }

  // Find all tickets without RLS (for admin users - but still set user ID for RLS)
  async findAllWithoutRLS(filters = {}, userId = null) {
    // Even for admin users, we need to set the user ID for RLS policies to work
    if (userId) {
      await this.setCurrentUser(userId);
    }
    
    const queryBuilder = this.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.organisation', 'organisation');
    
    // Apply filters
    if (filters.status) {
      queryBuilder.andWhere('ticket.status = :status', { status: filters.status });
    }
    
    if (filters.user_id) {
      queryBuilder.andWhere('ticket.userId = :userId', { userId: filters.user_id });
    }
    
    if (filters.organisation_id) {
      queryBuilder.andWhere('ticket.organisationId = :organisationId', { organisationId: filters.organisation_id });
    }
    
    // Add search functionality
    if (filters.search) {
      queryBuilder.andWhere(
        '(ticket.title ILIKE :search OR ticket.description ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
    
    // Add date range filtering
    if (filters.created_after) {
      queryBuilder.andWhere('ticket.createdAt >= :createdAfter', { 
        createdAfter: new Date(filters.created_after) 
      });
    }
    
    if (filters.created_before) {
      queryBuilder.andWhere('ticket.createdAt <= :createdBefore', { 
        createdBefore: new Date(filters.created_before) 
      });
    }
    
    // Add pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const offset = (page - 1) * limit;
    
    queryBuilder.skip(offset).take(limit);
    queryBuilder.orderBy('ticket.createdAt', 'DESC');
    
    const [tickets, total] = await queryBuilder.getManyAndCount();
    
    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Find ticket by ID without RLS (for admin users - but still set user ID for RLS)
  async findByIdWithoutRLS(id, userId = null) {
    // Even for admin users, we need to set the user ID for RLS policies to work
    if (userId) {
      await this.setCurrentUser(userId);
    }
    
    const ticket = await this.findOne({
      where: { id: parseInt(id) },
      relations: ['user', 'organisation']
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  }

  // Create ticket without RLS (for admin users - but RLS will block this)
  async createWithoutRLS(ticketData, userId = null) {
    // Even for admin users, we need to set the user ID for RLS policies to work
    if (userId) {
      await this.setCurrentUser(userId);
    }
    
    const ticket = this.create(ticketData);
    const savedTicket = await this.save(ticket);
    
    // Return the created ticket
    return await this.findOne({
      where: { id: savedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  // Update ticket without RLS (for admin users)
  async updateWithoutRLS(id, updateData, userId = null) {
    // Even for admin users, we need to set the user ID for RLS policies to work
    if (userId) {
      await this.setCurrentUser(userId);
    }
    
    const ticket = await this.findOne({ 
      where: { id: parseInt(id) },
      relations: ['user', 'organisation']
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        ticket[key] = updateData[key];
      }
    });
    
    ticket.updatedAt = new Date();
    const updatedTicket = await this.save(ticket);
    
    // Return the updated ticket
    return await this.findOne({
      where: { id: updatedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  // Delete ticket without RLS (for admin users)
  async deleteWithoutRLS(id, userId = null) {
    // Even for admin users, we need to set the user ID for RLS policies to work
    if (userId) {
      await this.setCurrentUser(userId);
    }
    
    const ticket = await this.findOne({ 
      where: { id: parseInt(id) }
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    await this.remove(ticket);
    return true;
  }

  // Get ticket stats without RLS (for admin users)
  async getStatsWithoutRLS(userId = null) {
    // Even for admin users, we need to set the user ID for RLS policies to work
    if (userId) {
      await this.setCurrentUser(userId);
    }
    
    const stats = await this.createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany();
    
    // Get total count
    const totalResult = await this.createQueryBuilder('ticket')
      .select('COUNT(*)', 'total')
      .getRawOne();
    
    return {
      stats,
      total: parseInt(totalResult.total)
    };
  }
} 