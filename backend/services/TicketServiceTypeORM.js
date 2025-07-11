import { TicketRepository } from '../db/repositories/TicketRepository.js';
import { getRepository } from '../db/typeorm.js';
import { User } from '../db/entities/User.js';
import { Organisation } from '../db/entities/Organisation.js';
import { TICKET_STATUS } from '../constants/index.js';
import { AppDataSource } from '../config/database.js';

export class TicketServiceTypeORM {
  constructor() {
    this.ticketRepository = new TicketRepository(AppDataSource);
    this.userRepository = getRepository(User);
    this.orgRepository = getRepository(Organisation);
    this.statuses = Object.values(TICKET_STATUS);
  }

  async findAll(filters = {}, userId) {
    return await this.ticketRepository.findAllWithRLS(filters, userId);
  }

  async findById(id, userId) {
    return await this.ticketRepository.findByIdWithRLS(id, userId);
  }

  async create(ticketData, userId) {
    const { title, description, status, user_id, organisation_id } = ticketData;
    
    // Validate status
    if (status && !this.statuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${this.statuses.join(', ')}`);
    }
    
    // Verify user and organisation exist
    const [user, organisation] = await Promise.all([
      this.userRepository.findOne({ where: { id: user_id } }),
      this.orgRepository.findOne({ where: { id: organisation_id } })
    ]);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    
    // Verify user belongs to the organisation
    if (user.organisationId !== organisation_id) {
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
    
    return await this.ticketRepository.createWithRLS(ticketDataToSave, userId);
  }

  async update(id, updateData, userId) {
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
    
    return await this.ticketRepository.updateWithRLS(id, filteredUpdateData, userId);
  }

  async delete(id, userId) {
    return await this.ticketRepository.deleteWithRLS(id, userId);
  }

  async getTicketStats(userId) {
    return await this.ticketRepository.getStatsWithRLS(userId);
  }
} 