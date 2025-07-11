import express from 'express';
import { OrganisationController } from '../controllers/OrganisationController.js';
import { validateOrganisation, validatePagination } from '../middleware/validation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const organisationController = new OrganisationController();

// GET /organisations - Get all organisations (admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, organisationController.getAllOrganisations);

// GET /organisations/stats - Get organisation statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, organisationController.getOrganisationStats);

// GET /organisations/:id - Get a specific organisation (admin only)
router.get('/:id', authenticateToken, requireAdmin, organisationController.getOrganisationById);

// POST /organisations - Create a new organisation (admin only)
router.post('/', authenticateToken, requireAdmin, validateOrganisation, organisationController.createOrganisation);

// PATCH /organisations/:id - Update an organisation (admin only)
router.patch('/:id', authenticateToken, requireAdmin, validateOrganisation, organisationController.updateOrganisation);

// DELETE /organisations/:id - Delete an organisation (admin only)
router.delete('/:id', authenticateToken, requireAdmin, organisationController.deleteOrganisation);

export default router; 