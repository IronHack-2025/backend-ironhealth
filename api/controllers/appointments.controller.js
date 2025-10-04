// GET y POST, DELETE, PUT(cancel), PATCH(notes) estandarizados

import Appointment from '../models/Appointment.model.js';
import Patient from '../models/Patient.model.js';
import Professional from '../models/professionals.model.js';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import { success, error, validationError } from '../middlewares/responseHandler.js';

// Helper para detectar idioma preferido (es/en) del paciente
function pickLang(req) {
  const bodyLang = req?.body?.preferredLang;
  if (bodyLang === 'en' || bodyLang === 'es') return bodyLang;
  const header = (req.headers['accept-language'] || '').slice(0, 2).toLowerCase();
  return header === 'en' ? 'en' : 'es';
}

// Base del portal del paciente para enlaces en emails (Producción / Local):
const PORTAL_BASE = (process.env.PORTAL_URL || 'http://localhost:5173').replace(/\/+$/, '');

// GET /api/appointment
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().lean();
    // Siempre devolvemos "sobre" aunque la lista esté vacía
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
    const { professionalId, patientId, startDate, endDate, notes } = req.body || {};
    const validationErrors = [];

    // Validaciones básicas (reusamos códigos existentes)
    if (!professionalId) {
      validationErrors.push({
        field: 'professionalId',
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }
    if (!patientId) {
      validationErrors.push({
        field: 'patientId',
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }
    if (!startDate) {
      validationErrors.push({
        field: 'startDate',
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }
    if (!endDate) {
      validationErrors.push({
        field: 'endDate',
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
    }

    // Validación simple de ObjectId (reutilizo NAME_INVALID_CHARACTERS como placeholder)
    const oid = /^[a-fA-F0-9]{24}$/;
    if (professionalId && !oid.test(professionalId)) {
      validationErrors.push({
        field: 'professionalId',
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }
    if (patientId && !oid.test(patientId)) {
      validationErrors.push({
        field: 'patientId',
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

    // Validación fechas
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const now = new Date();

    if (start && end && end <= start) {
      // Placeholder con meta (podéis crear un código específico más adelante)
      validationErrors.push({
        field: 'endDate',
        code: VALIDATION_CODES.END_TIME_BEFORE_START_TIME,
        meta: { min: 1, max: 999, hint: 'end must be after start' },
      });
    }
    if (start && start < now) {
      validationErrors.push({
        field: 'startDate',
        code: VALIDATION_CODES.APPOINTMENT_IN_PAST,
      }); // placeholder: fecha pasada
    }
    if (end && end < now) {
      validationErrors.push({
        field: 'endDate',
        code: VALIDATION_CODES.APPOINTMENT_IN_PAST,
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
      status: { cancelled: false },
    });
    const savedAppointment = await appointment.save();

    // HOOK de email de confirmación (NO bloqueante)
    // Programa el envío con setImmediate para no retrasar la respuesta HTTP.
    // Usa la plantilla 'appointment_booked'.
    try {
      const lang = pickLang(req);
      const { patientId: pid, professionalId: prid } = savedAppointment;

      setImmediate(() => {
        (async () => {
          try {
            // 1) Busca paciente y profesional por _id
            const [patient, professional] = await Promise.all([
              Patient.findById(pid, 'firstName lastName email preferredLang').lean(),
              Professional.findById(prid, 'firstName lastName profession specialty').lean(),
            ]);

            // Si no hay email del paciente, no enviamos
            if (!patient?.email) return;

            // 2) Nombres a mostrar en el email + idioma preferido
            const langPref =
              patient?.preferredLang === 'en' || patient?.preferredLang === 'es'
                ? patient.preferredLang
                : lang;
            const patientName =
              [patient?.firstName, patient?.lastName].filter(Boolean).join(' ') ||
              (langPref === 'en' ? 'Patient' : 'Paciente');
            const professionalName =
              [professional?.firstName, professional?.lastName].filter(Boolean).join(' ') ||
              (langPref === 'en' ? 'Doctor' : 'Profesional');

            // 3) Construye el deep-link a la cita en el portal
            //    En local → http://localhost:5173/appointments/:id
            //    En prod  → https://ironhealth.cat/appointments/:id (configurando PORTAL_URL)
            const appointmentUrl = `${PORTAL_BASE}/appointments/${savedAppointment._id}`;

            // 4) Carga perezosa del servicio y envía plantilla
            const { emailService } = await import('../services/email/index.js');

            await emailService.sendTemplate({
              template: 'appointment_booked',
              to: patient.email,
              data: {
                patientName,
                professionalName,
                start: savedAppointment.startDate, // Date
                end: savedAppointment.endDate, // Date
                location: savedAppointment.location || 'Consulta',
                portalUrl: appointmentUrl, // botón del email
                lang: langPref,
              },
            });
          } catch (err) {
            console.error('[EMAIL appointment_booked]', err?.message);
          }
        })();
      });
    } catch (err) {
      console.error('[EMAIL appointment_booked schedule]', err?.message);
    }

    return success(res, savedAppointment, MESSAGE_CODES.SUCCESS.APPOINTMENT_CREATED, 201);
  } catch (e) {
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
    const { id } = req.params || {};
    const oid = /^[a-fA-F0-9]{24}$/;
    if (!id || !oid.test(id)) {
      return validationError(
        res,
        [{ field: 'id', code: VALIDATION_CODES.NAME_INVALID_CHARACTERS }],
        400
      );
    }

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
    const { id } = req.params || {};
    const oid = /^[a-fA-F0-9]{24}$/;
    if (!id || !oid.test(id)) {
      return validationError(res, [{ field: 'id', code: VALIDATION_CODES.ID_INVALID_FORMAT }], 400);
    }

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
    const { id } = req.params || {};
    const { notes, professionalNotes } = req.body || {};
    const oid = /^[a-fA-F0-9]{24}$/;
    const validationErrors = [];

    if (!id || !oid.test(id)) {
      return validationError(res, [{ field: 'id', code: VALIDATION_CODES.ID_INVALID_FORMAT }], 400);
    }

    // Validar que al menos uno de los campos se proporcione
    if (!notes && !professionalNotes) {
      validationErrors.push({
        field: 'notes',
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
      validationErrors.push({
        field: 'professionalNotes',
        code: VALIDATION_CODES.FORM_FIELDS_REQUIRED,
      });
      return validationError(res, validationErrors, 400);
    }

    // Construir el objeto de actualización dinámicamente
    const updateFields = {};
    if (notes !== undefined) updateFields.notes = notes;
    if (professionalNotes !== undefined) updateFields.professionalNotes = professionalNotes;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updateFields },
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
