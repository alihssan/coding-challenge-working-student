import { getRepository } from '../db/typeorm.js';
import { Organisation } from '../db/entities/Organisation.js';

export class OrganisationService {
  constructor() {
    this.orgRepo = getRepository(Organisation);
  }

  async findAll(filters = {}) {
    const { page = 1, limit = 10 } = filters;
    
    let queryBuilder = this.orgRepo
      .createQueryBuilder('organisation')
      .leftJoinAndSelect('organisation.users', 'users')
      .leftJoinAndSelect('organisation.tickets', 'tickets');
    
    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(offset).take(limit);
    
    const [organisations, total] = await queryBuilder.getManyAndCount();
    
    return {
      organisations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    const organisation = await this.orgRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['users', 'tickets']
    });
    
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    
    return organisation;
  }

  async create(orgData) {
    const { name } = orgData;
    
    const organisation = this.orgRepo.create({ name });
    const savedOrganisation = await this.orgRepo.save(organisation);
    
    return savedOrganisation;
  }

  async update(id, updateData) {
    const organisation = await this.orgRepo.findOne({ where: { id: parseInt(id) } });
    
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    
    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        organisation[key] = updateData[key];
      }
    });
    
    const updatedOrganisation = await this.orgRepo.save(organisation);
    
    return updatedOrganisation;
  }

  async delete(id) {
    const organisation = await this.orgRepo.findOne({ where: { id: parseInt(id) } });
    
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    
    await this.orgRepo.remove(organisation);
    return true;
  }

  async getOrganisationStats() {
    const stats = await this.orgRepo
      .createQueryBuilder('organisation')
      .leftJoin('organisation.users', 'users')
      .leftJoin('organisation.tickets', 'tickets')
      .select('organisation.name', 'name')
      .addSelect('COUNT(DISTINCT users.id)', 'userCount')
      .addSelect('COUNT(DISTINCT tickets.id)', 'ticketCount')
      .groupBy('organisation.name')
      .getRawMany();
    
    return stats;
  }
} 