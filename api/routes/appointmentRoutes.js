import express from 'express';
import {
  postAppointments,
  getAppointments,
  deleteAppointments,
  cancelAppointments,
  updateAppointmentNotes,
} from '../controllers/appointmentControllers.js';
import {
  verifyToken,
  requireRole,
  requireOwnAppointmentOrAdmin,
  requireCancelOwnAppointment,
} from '../middlewares/auth.js';

const router = express.Router();

// Crear cita - admins y profesionales pueden crear cualquier cita, pacientes pueden crear sus propias citas
router.post('/appointment', verifyToken, postAppointments);

// Ver citas - todos los usuarios autenticados pueden ver citas (filtrado en el controlador)
router.get('/appointment', verifyToken, getAppointments);

// Eliminar cita - solo la propia cita (pacientes) o cualquier cita (admin/professional)
router.delete('/appointment/:id', verifyToken, requireOwnAppointmentOrAdmin, deleteAppointments);

// Cancelar cita - admins y profesionales pueden cancelar cualquier cita, pacientes solo las propias
router.put('/appointment/:id', verifyToken, requireCancelOwnAppointment, cancelAppointments);

// Actualizar notas - solo profesionales y admins pueden modificar cualquier cita
router.patch(
  '/appointment/:id/notes',
  verifyToken,
  requireRole(['admin', 'professional']),
  updateAppointmentNotes
);

export default router;
