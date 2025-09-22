// GET y POST, DELETE, PUT(cancel), PATCH(notes) estandarizados

import Appointment from "../models/Appointment.model.js";
import { MESSAGE_CODES, VALIDATION_CODES } from "../utils/messageCodes.js";
import { success, error, validationError, } from "../middlewares/responseHandler.js";

// GET /api/appointment
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();
    // Siempre devolvemos "sobre" aunque la lista esté vacía
    return success(
      res,
      appointments,
      MESSAGE_CODES.SUCCESS.APPOINTMENTS_RETRIEVED,
      200
    );
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || "Unexpected error"
    );
  }
};

// POST /api/appointment
const postAppointments = async (req, res) => {
  try {
    const { professionalId, patientId, startDate, endDate, notes } =
      req.body || {};
    const validationErrors = [];

    // Validaciones básicas (reusamos códigos existentes)
    if (!professionalId) {
      validationErrors.push({
        field: "professionalId",
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }
    if (!patientId) {
      validationErrors.push({
        field: "patientId",
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }
    if (!startDate) {
      validationErrors.push({
        field: "startDate",
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }
    if (!endDate) {
      validationErrors.push({
        field: "endDate",
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }

    // Validación simple de ObjectId (reutilizo NAME_INVALID_CHARACTERS como placeholder)
    const oid = /^[a-fA-F0-9]{24}$/;
    if (professionalId && !oid.test(professionalId)) {
      validationErrors.push({
        field: "professionalId",
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }
    if (patientId && !oid.test(patientId)) {
      validationErrors.push({
        field: "patientId",
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

    // Validación fechas
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const now = new Date();

    if (start && end && end <= start) {
      // Reusamos NAME_MIN_LENGTH como placeholder, con meta explicativa (podemos crear un código específico después)
      validationErrors.push({
        field: "endDate",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 1, max: 999, hint: "end must be after start" },
      });
    }
    if (start && start < now) {
      validationErrors.push({
        field: "startDate",
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      }); // placeholder: fecha pasada
    }
    if (end && end < now) {
      validationErrors.push({
        field: "endDate",
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      }); // placeholder: fecha pasada
    }


    if (validationErrors.length) {
      return validationError(res, validationErrors, 400);
    }

    // Si todo va bien crea la cita
    const appointment = new Appointment({
      professionalId,
      patientId,
      startDate: start,
      endDate: end,
      notes,
    });
    const savedAppointment = await appointment.save();

    return success(res, savedAppointment, MESSAGE_CODES.SUCCESS.APPOINTMENT_CREATED, 201);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || "Unexpected error"
    );
  }
};

// DELETE /api/appointment/:id
const deleteAppointments = async (req, res) => {
  try {
    const { id } = req.params || {};
    const oid = /^[a-fA-F0-9]{24}$/;
    if (!id || !oid.test(id)) {
      return validationError(
        res,
        [{ field: "id", code: VALIDATION_CODES.NAME_INVALID_CHARACTERS }],
        400
      );
    }

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_NOT_FOUND, 404);
    }

    return success(
      res,
      deleted,
      MESSAGE_CODES.SUCCESS.APPOINTMENT_DELETED,
      200
    );
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || "Unexpected error"
    );
  }
};

// PUT /api/appointment/:id  (cancelar)
const cancelAppointments = async (req, res) => {
  try {
    const { id } = req.params || {};
    const oid = /^[a-fA-F0-9]{24}$/;
    if (!id || !oid.test(id)) {
      return validationError(
        res,
        [{ field: "id", code: VALIDATION_CODES.ID_INVALID_FORMAT }],
        400
      );
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: { cancelled: true, timestamp: new Date() } } },
      { new: true }
    );
    if (!updatedAppointment) {
      return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_NOT_FOUND, 404);
    }

    return success(
      res,
      updatedAppointment,
      MESSAGE_CODES.SUCCESS.APPOINTMENT_UPDATED,
      200
    );
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || "Unexpected error"
    );
  }
};

// PATCH /api/appointment/:id/notes  (actualizar notas)
const updateAppointmentNotes = async (req, res) => {
  try {
    const { id } = req.params || {};
    const { notes } = req.body || {};
    const oid = /^[a-fA-F0-9]{24}$/;

    if (!id || !oid.test(id)) {
      return validationError(
        res,
        [{ field: "id", code: VALIDATION_CODES.ID_INVALID_FORMAT }],
        400
      );
    }

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
      e?.message || "Unexpected error"
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
