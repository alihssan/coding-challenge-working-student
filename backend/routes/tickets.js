import express from 'express';
import { TicketController } from '../controllers/TicketController.js';
import { validateTicket, validatePagination } from '../middleware/validation.js';
import { authenticateToken, requireOrganisation } from '../middleware/auth.js';

const router = express.Router();
const ticketController = new TicketController();

// GET /tickets - Get all tickets with optional filtering (authenticated users only)
router.get('/', authenticateToken, validatePagination, ticketController.getAllTickets);

// GET /tickets/stats - Get ticket statistics (authenticated users only)
router.get('/stats', authenticateToken, ticketController.getTicketStats);

// GET /tickets/:id - Get a specific ticket (authenticated users only)
router.get('/:id', authenticateToken, ticketController.getTicketById);

// POST /tickets - Create a new ticket (authenticated users only)
router.post('/', authenticateToken, validateTicket, ticketController.createTicket);

// PATCH /tickets/:id - Update a ticket (authenticated users only)
router.patch('/:id', authenticateToken, validateTicket, ticketController.updateTicket);

// DELETE /tickets/:id - Delete a ticket (authenticated users only)
router.delete('/:id', authenticateToken, ticketController.deleteTicket);

export default router; 