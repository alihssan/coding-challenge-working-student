import { getRepository } from '../db/typeorm.js';
import { User } from '../db/entities/User.js';
import { Organisation } from '../db/entities/Organisation.js';

export class UserService {
  constructor() {
    // Lazy loading of repositories
  }

  get userRepo() {
    return getRepository(User);
  }

  get orgRepo() {
    return getRepository(Organisation);
  }

  async findAll(filters = {}, user = null) {
    const { organisation_id, page = 1, limit = 10 } = filters;
    
    let queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organisation', 'organisation');
    
    // Only filter by organisation if user is not admin
    if (organisation_id && (!user || user.role !== 'admin')) {
      queryBuilder = queryBuilder.andWhere('user.organisationId = :organisationId', { organisationId: organisation_id });
    }
    
    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(offset).take(limit);
    
    const [users, total] = await queryBuilder.getManyAndCount();
    
    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id) {
    const user = await this.userRepo.findOne({
      where: { id: parseInt(id) },
      relations: ['organisation', 'tickets']
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(userData) {
    const { name, email, organisation_id } = userData;
    
    // Verify organisation exists
    const organisation = await this.orgRepo.findOne({ where: { id: organisation_id } });
    
    if (!organisation) {
      throw new Error('Organisation not found');
    }
    
    // Check if email already exists
    if (email) {
      const existingUser = await this.userRepo.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }
    
    const user = this.userRepo.create({
      name,
      email,
      organisationId: organisation_id
    });
    
    const savedUser = await this.userRepo.save(user);
    
    // Fetch the saved user with relations and exclude password
    const userWithRelations = await this.userRepo.findOne({
      where: { id: savedUser.id },
      relations: ['organisation']
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = userWithRelations;
    return userWithoutPassword;
  }

  async update(id, updateData) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(id) } });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepo.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }
    
    // Update only provided fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });
    
    const updatedUser = await this.userRepo.save(user);
    
    // Fetch the updated user with relations and exclude password
    const userWithRelations = await this.userRepo.findOne({
      where: { id: updatedUser.id },
      relations: ['organisation']
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = userWithRelations;
    return userWithoutPassword;
  }

  async delete(id) {
    const user = await this.userRepo.findOne({ where: { id: parseInt(id) } });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    await this.userRepo.remove(user);
    return true;
  }

  async getUserStats() {
    const stats = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.organisation', 'organisation')
      .select('organisation.name', 'organisation')
      .addSelect('COUNT(*)', 'userCount')
      .groupBy('organisation.name')
      .getRawMany();
    
    return stats;
  }
} 