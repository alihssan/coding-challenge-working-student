import { Repository } from "typeorm";
import { Ticket } from "../entities/Ticket.js";

export class TicketRepository extends Repository {
  constructor(dataSource) {
    super(Ticket, dataSource.createEntityManager());
  }

  // Set current user ID for RLS
  async setCurrentUser(userId) {
    await this.query('SELECT set_current_user_id($1)', [userId]);
  }

  // Find all tickets with RLS applied
  async findAllWithRLS(filters = {}, userId) {
    await this.setCurrentUser(userId);
    
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
    
    // Return the created ticket with relations
    return await this.findOne({
      where: { id: savedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  // Update ticket with RLS
  async updateWithRLS(id, updateData, userId) {
    await this.setCurrentUser(userId);
    
    const ticket = await this.findOne({ where: { id: parseInt(id) } });
    
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
    
    // Return the updated ticket with relations
    return await this.findOne({
      where: { id: updatedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  // Delete ticket with RLS
  async deleteWithRLS(id, userId) {
    await this.setCurrentUser(userId);
    
    const ticket = await this.findOne({ where: { id: parseInt(id) } });
    
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
    
    return stats;
  }
} 