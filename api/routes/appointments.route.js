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

const router = express.Router();

// POST /api/appointment
router.post(
  '/appointment',
  createAppointmentValidation,
  validate, // This middleware checks for validation errors
  postAppointments
);

// GET /api/appointment
router.get('/appointment', getAppointments);

// DELETE /api/appointment/:id
router.delete('/appointment/:id', appointmentIdValidation, validate, deleteAppointments);

// PUT /api/appointment/:id (cancel)
router.put('/appointment/:id', appointmentIdValidation, validate, cancelAppointments);

// PATCH /api/appointment/:id/notes
router.patch(
  '/appointment/:id/notes',
  updateAppointmentNotesValidation,
  validate,
  updateAppointmentNotes
);

export default router;
