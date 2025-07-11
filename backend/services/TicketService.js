import { getRepository } from '../db/typeorm.js';
import { Ticket } from '../db/entities/Ticket.js';
import { User } from '../db/entities/User.js';
import { Organisation } from '../db/entities/Organisation.js';
import { TICKET_STATUS } from '../constants/index.js';

export class TicketService {
  constructor() {
    this.ticketRepo = getRepository(Ticket);
    this.userRepo = getRepository(User);
    this.orgRepo = getRepository(Organisation);
  }

  async findAll(filters = {}) {
    const { status, organisation_id, user_id, page = 1, limit = 10 } = filters;
    
    let queryBuilder = this.ticketRepo
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.organisation', 'organisation');
    
    if (status) {
      queryBuilder = queryBuilder.andWhere('ticket.status = :status', { status });
    }
    
    if (organisation_id) {
      queryBuilder = queryBuilder.andWhere('ticket.organisationId = :organisationId', { organisationId: organisation_id });
    }
    
    if (user_id) {
      queryBuilder = queryBuilder.andWhere('ticket.userId = :userId', { userId: user_id });
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(offset).take(limit);
    
    const [tickets, total] = await queryBuilder.getManyAndCount();
    
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

  async findById(id) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['user', 'organisation']
    });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  }

  async create(ticketData) {
    const { title, description, status, user_id, organisation_id } = ticketData;
    
    // Verify user and organisation exist
    const user = await this.userRepo.findOne({ where: { id: user_id } });
    const organisation = await this.orgRepo.findOne({ where: { id: organisation_id } });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    
    const ticket = this.ticketRepo.create({
      title,
      description,
      status: status || TICKET_STATUS.OPEN,
      userId: user_id,
      organisationId: organisation_id
    });
    
    const savedTicket = await this.ticketRepo.save(ticket);
    
    // Fetch the saved ticket with relations
    return await this.ticketRepo.findOne({
      where: { id: savedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  async update(id, updateData) {
    const ticket = await this.ticketRepo.findOne({ where: { id: parseInt(id) } });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        ticket[key] = updateData[key];
      }
    });
    
    const updatedTicket = await this.ticketRepo.save(ticket);
    
    // Fetch the updated ticket with relations
    return await this.ticketRepo.findOne({
      where: { id: updatedTicket.id },
      relations: ['user', 'organisation']
    });
  }

  async delete(id) {
    const ticket = await this.ticketRepo.findOne({ where: { id: parseInt(id) } });
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    await this.ticketRepo.remove(ticket);
    return true;
  }

  async getTicketStats() {
    const stats = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany();
    
    return stats;
  }
} 