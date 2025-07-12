import { TicketRepository } from '../db/repositories/TicketRepository.js';
import { getRepository } from '../db/typeorm.js';
import { User } from '../db/entities/User.js';
import { Organisation } from '../db/entities/Organisation.js';
import { TICKET_STATUS } from '../constants/index.js';
import { AppDataSource } from '../config/database.js';

export class TicketServiceTypeORM {
  constructor() {
    this.statuses = Object.values(TICKET_STATUS);
  }

  get ticketRepository() {
    return new TicketRepository(AppDataSource);
  }

  get userRepository() {
    return getRepository(User);
  }

  get orgRepository() {
    return getRepository(Organisation);
  }

  async findAll(filters = {}, user) {
    const userId = user?.userId || user;
    
    console.log(`TicketServiceTypeORM.findAll - User:`, user);
    console.log(`TicketServiceTypeORM.findAll - User ID: ${userId}, Role: ${user?.role}`);
    
    // Check if user is admin - if so, use without RLS but still pass user ID for RLS policies
    if (user?.role === 'admin') {
      console.log(`Using findAllWithoutRLS for admin user`);
      return await this.ticketRepository.findAllWithoutRLS(filters, userId);
    }
    
    console.log(`Using findAllWithRLS for regular user`);
    return await this.ticketRepository.findAllWithRLS(filters, userId);
  }

  async findById(id, user) {
    const userId = user?.userId || user;
    
    // Check if user is admin - if so, use without RLS but still pass user ID for RLS policies
    if (user?.role === 'admin') {
      return await this.ticketRepository.findByIdWithoutRLS(id, userId);
    }
    
    return await this.ticketRepository.findByIdWithRLS(id, userId);
  }

  async create(ticketData, user) {
    const userId = user?.userId || user;
    const { title, description, status, user_id, organisation_id } = ticketData;
    
    // Disable ticket creation for admin users (RLS will also block this)
    if (user?.role === 'admin') {
      throw new Error('Admin users cannot create tickets. Only regular users can create tickets.');
    }
    
    // Validate status
    if (status && !this.statuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${this.statuses.join(', ')}`);
    }
    
    // Verify user and organisation exist
    const [ticketUser, organisation] = await Promise.all([
      this.userRepository.findOne({ where: { id: user_id } }),
      this.orgRepository.findOne({ where: { id: organisation_id } })
    ]);
    
    if (!ticketUser) {
      throw new Error('User not found');
    }
    
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    
    // Verify user belongs to the organisation (since admin users can't create tickets)
    if (ticketUser.organisationId !== organisation_id) {
      throw new Error('User does not belong to the specified organisation');
    }
    
    // Create ticket data
    const ticketDataToSave = {
      title,
      description,
      status: status || TICKET_STATUS.OPEN,
      userId: user_id,
      organisationId: organisation_id
    };
    
    // Create ticket with RLS (admin users can't create tickets)
    return await this.ticketRepository.createWithRLS(ticketDataToSave, userId);
  }

  async update(id, updateData, user) {
    const userId = user?.userId || user;
    const { title, description, status } = updateData;
    
    // Validate status if provided
    if (status && !this.statuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${this.statuses.join(', ')}`);
    }
    
    // Only allow updating specific fields
    const allowedFields = ['title', 'description', 'status'];
    const filteredUpdateData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });
    
    if (Object.keys(filteredUpdateData).length === 0) {
      throw new Error('No valid fields to update');
    }
    
    // Check if user is admin - if so, use without RLS but still pass user ID for RLS policies
    if (user?.role === 'admin') {
      return await this.ticketRepository.updateWithoutRLS(id, filteredUpdateData, userId);
    }
    
    return await this.ticketRepository.updateWithRLS(id, filteredUpdateData, userId);
  }

  async delete(id, user) {
    const userId = user?.userId || user;
    
    // Check if user is admin - if so, use without RLS but still pass user ID for RLS policies
    if (user?.role === 'admin') {
      return await this.ticketRepository.deleteWithoutRLS(id, userId);
    }
    
    return await this.ticketRepository.deleteWithRLS(id, userId);
  }

  async getTicketStats(user) {
    const userId = user?.userId || user;
    
    // Check if user is admin - if so, use without RLS but still pass user ID for RLS policies
    if (user?.role === 'admin') {
      const result = await this.ticketRepository.getStatsWithoutRLS(userId);
      return {
        total: result.total,
        open: result.stats.find(s => s.status === 'open')?.count || 0,
        in_progress: result.stats.find(s => s.status === 'in_progress')?.count || 0,
        closed: result.stats.find(s => s.status === 'closed')?.count || 0,
        pending: result.stats.find(s => s.status === 'pending')?.count || 0
      };
    }
    
    const result = await this.ticketRepository.getStatsWithRLS(userId);
    return {
      total: result.total,
      open: result.stats.find(s => s.status === 'open')?.count || 0,
      in_progress: result.stats.find(s => s.status === 'in_progress')?.count || 0,
      closed: result.stats.find(s => s.status === 'closed')?.count || 0,
      pending: result.stats.find(s => s.status === 'pending')?.count || 0
    };
  }
} 