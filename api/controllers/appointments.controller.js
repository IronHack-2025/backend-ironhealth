import Appointment from '../models/Appointment.model.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';

// GET /api/appointment
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();
    return success(res, appointments, MESSAGE_CODES.SUCCESS.APPOINTMENTS_RETRIEVED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

// POST /api/appointment
const postAppointments = async (req, res) => {
  try {
    // Data is already validated and sanitized by express-validator middleware
    const { professionalId, patientId, startDate, endDate, notes } = req.body;

    const newAppointment = new Appointment({
      professionalId,
      patientId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes,
      status: { cancelled: false },
    });

    await newAppointment.save();

    return success(res, newAppointment, MESSAGE_CODES.SUCCESS.APPOINTMENT_CREATED, 201);
  } catch (e) {
    // Handle potential conflict errors (e.g., duplicate appointments)
    if (e.code === 11000) {
      return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_CONFLICT, 409, 'Appointment time conflict');
    }
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

// DELETE /api/appointment/:id
const deleteAppointments = async (req, res) => {
  try {
    const { id } = req.params; // ID is validated by middleware
    const deleted = await Appointment.findByIdAndDelete(id);

    if (!deleted) {
      return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_NOT_FOUND, 404);
    }

    return success(res, deleted, MESSAGE_CODES.SUCCESS.APPOINTMENT_DELETED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

// PUT /api/appointment/:id  (cancelar)
const cancelAppointments = async (req, res) => {
  try {
    const { id } = req.params; // ID is validated by middleware

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: { cancelled: true, timestamp: new Date() } } },
      { new: true }
    );

    if (!updatedAppointment) {
      return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_NOT_FOUND, 404);
    }

    return success(res, updatedAppointment, MESSAGE_CODES.SUCCESS.APPOINTMENT_CANCELLED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

// PATCH /api/appointment/:id/notes  (actualizar notas)
const updateAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params; // ID is validated by middleware
    const { notes } = req.body; // Notes are validated and sanitized by middleware

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { notes } },
      { new: true }
    );

    if (!updatedAppointment) {
      return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_NOT_FOUND, 404);
    }

    return success(res, updatedAppointment, MESSAGE_CODES.SUCCESS.NOTES_UPDATED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

export {
  getAppointments,
  postAppointments,
  deleteAppointments,
  cancelAppointments,
  updateAppointmentNotes,
};
