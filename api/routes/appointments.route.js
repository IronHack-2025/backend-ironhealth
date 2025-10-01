import express from 'express';
import {
  postAppointments,
  getAppointments,
  deleteAppointments,
  cancelAppointments,
  updateAppointmentNotes,
} from '../controllers/appointments.controller.js';
import {
  createAppointmentValidation,
  updateAppointmentNotesValidation,
  appointmentIdValidation,
  validate,
} from '../validators/appointment.validators.js';
import { verifyToken,
  requireRole,
  requireOwnAppointmentOrAdmin,
  requireCancelOwnAppointment
 } from '../middlewares/auth.js';

const router = express.Router();

// POST /api/appointment
router.post(
  '/appointment',
  createAppointmentValidation,
  validate, // This middleware checks for validation errors
  verifyToken,
  postAppointments
);

// GET /api/appointment
router.get('/appointment',
   verifyToken, 
   getAppointments);

// DELETE /api/appointment/:id
router.delete('/appointment/:id',
  verifyToken,
  requireOwnAppointmentOrAdmin,
  appointmentIdValidation,
  validate,
  deleteAppointments
);

// PUT /api/appointment/:id (cancel)
router.put('/appointment/:id',
  verifyToken,
  requireOwnAppointmentOrAdmin,
  appointmentIdValidation,
  validate,
  cancelAppointments
);

// PATCH /api/appointment/:id/notes
router.patch(
  '/appointment/:id/notes',
  verifyToken,
  requireRole(['admin', 'professional']),
  appointmentIdValidation,
  updateAppointmentNotesValidation,
  validate,
  updateAppointmentNotes
);

export default router;
