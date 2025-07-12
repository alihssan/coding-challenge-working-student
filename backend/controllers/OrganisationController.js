import { OrganisationService } from '../services/OrganisationService.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export class OrganisationController {
  constructor() {
    this.organisationService = new OrganisationService();
  }

  getAllOrganisations = asyncHandler(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await this.organisationService.findAll(filters);
    
    return ApiResponse.success(res, result.organisations);
  });

  getOrganisationById = asyncHandler(async (req, res) => {
    const organisation = await this.organisationService.findById(req.params.id);
    return ApiResponse.success(res, organisation);
  });

  createOrganisation = asyncHandler(async (req, res) => {
    const organisation = await this.organisationService.create(req.body);
    return ApiResponse.created(res, organisation);
  });

  updateOrganisation = asyncHandler(async (req, res) => {
    const organisation = await this.organisationService.update(req.params.id, req.body);
    return ApiResponse.success(res, organisation);
  });

  deleteOrganisation = asyncHandler(async (req, res) => {
    await this.organisationService.delete(req.params.id);
    return ApiResponse.success(res, null);
  });

  getOrganisationStats = asyncHandler(async (req, res) => {
    const stats = await this.organisationService.getOrganisationStats();
    return ApiResponse.success(res, stats);
  });
} 