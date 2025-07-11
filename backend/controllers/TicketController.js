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

    const result = await this.ticketService.findAll(filters, req.user.userId);
    
    return ApiResponse.success(res, result.tickets, 'Tickets retrieved successfully', 200, {
      pagination: result.pagination
    });
  });

  getTicketById = asyncHandler(async (req, res) => {
    const ticket = await this.ticketService.findById(req.params.id, req.user.userId);
    return ApiResponse.success(res, ticket, 'Ticket retrieved successfully');
  });

  createTicket = asyncHandler(async (req, res) => {
    const ticket = await this.ticketService.create(req.body, req.user.userId);
    return ApiResponse.created(res, ticket, 'Ticket created successfully');
  });

  updateTicket = asyncHandler(async (req, res) => {
    const ticket = await this.ticketService.update(req.params.id, req.body, req.user.userId);
    return ApiResponse.success(res, ticket, 'Ticket updated successfully');
  });

  deleteTicket = asyncHandler(async (req, res) => {
    await this.ticketService.delete(req.params.id, req.user.userId);
    return ApiResponse.success(res, null, 'Ticket deleted successfully');
  });

  getTicketStats = asyncHandler(async (req, res) => {
    const stats = await this.ticketService.getTicketStats(req.user.userId);
    return ApiResponse.success(res, stats, 'Ticket statistics retrieved successfully');
  });
} 