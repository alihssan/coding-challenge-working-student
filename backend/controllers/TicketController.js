import { TicketServiceTypeORM } from '../services/TicketServiceTypeORM.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export class TicketController {
  constructor() {
    this.ticketService = new TicketServiceTypeORM();
  }

  getAllTickets = asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      organisation_id: req.query.organisation_id,
      user_id: req.query.user_id,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await this.ticketService.findAll(filters, req.user);
    
    return ApiResponse.success(res, result.tickets);
  });

  getTicketById = asyncHandler(async (req, res) => {
    const ticket = await this.ticketService.findById(req.params.id, req.user);
    return ApiResponse.success(res, ticket);
  });

  createTicket = asyncHandler(async (req, res) => {
    const ticket = await this.ticketService.create(req.body, req.user);
    return ApiResponse.created(res, ticket);
  });

  updateTicket = asyncHandler(async (req, res) => {
    const ticket = await this.ticketService.update(req.params.id, req.body, req.user);
    return ApiResponse.success(res, ticket);
  });

  deleteTicket = asyncHandler(async (req, res) => {
    await this.ticketService.delete(req.params.id, req.user);
    return ApiResponse.success(res, null);
  });

  getTicketStats = asyncHandler(async (req, res) => {
    const stats = await this.ticketService.getTicketStats(req.user);
    return ApiResponse.success(res, stats);
  });
} 