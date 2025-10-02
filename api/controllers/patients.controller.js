import Patient from '../models/Patient.model.js';
import User from '../models/User.model.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';

export const postNewPatient = async (req, res) => {
  try {
    // Data is already validated and sanitized by express-validator middleware
    const {
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      imageUrl,
      dni,
      gender,
      street,
      city,
      postalCode,
      nationality,
      emergencyContact,
    } = req.body;

    // 1. Create patient without userId first
    const patientData = {
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      dni,
      gender,
      street,
      city,
      postalCode,
      nationality,
      emergencyContact,
    };

    if (imageUrl) {
      patientData.imageUrl = imageUrl;
    }

    const patient = await Patient.create(patientData);
    console.log(`Patient added successfully: ${patient}`);

    // 2. Create user automatically - middleware handles password hashing
    console.log(`🔑 Creating user with password: ${dni}`);

    const user = new User({
      email,
      password: dni, // Will be hashed by the model middleware
      role: 'patient',
      profileId: patient._id,
      profileModel: 'Patient',
    });
    await user.save();
    console.log(`✅ User created with email: ${email}`);

 /**
     * HOOK de email de bienvenida al paciente
     * - Detecta idioma preferido:
     *     1) req.body.preferredLang ('es' | 'en'), si viene del front
     *     2) cabecera Accept-Language (en/es); fallback 'es'
     * - Programa el envío con setImmediate para no retrasar la respuesta HTTP.
     * - Usa la plantilla 'patient_welcome'.
     */

 try {
  const langFromHeader = (req.headers["accept-language"] || "")
    .slice(0, 2)
    .toLowerCase();
  const lang =
    (req.body?.preferredLang &&
      ["es", "en"].includes(req.body.preferredLang) &&
      req.body.preferredLang) ||
    (langFromHeader === "en" ? "en" : "es");

  // Base del portal del paciente para enlaces en emails (Producción / Local):
  const portalUrl = process.env.PORTAL_URL || "http://localhost:5173";

  // Se agenda en el siguiente tick del event loop (no usamos await)
  setImmediate(() => {
    import("../services/email/index.js")
      .then(({ emailService }) => {
        emailService
          .sendTemplate({
            template: "patient_welcome",
            to: patient.email, // correo del nuevo paciente
            data: {
              firstName: patient.firstName, // datos para la plantilla
              portalUrl,
              lang,
            },
          })
          .catch((err) =>
            console.error("[EMAIL patient_welcome]", err?.message)
          );
      })
      .catch((err) =>
        console.error("[EMAIL dynamic import]", err?.message)
      );
  });
} catch (hookErr) {
  // Cualquier error al programar el hook no debe romper la creación
  console.error("[EMAIL patient_welcome schedule]", hookErr?.message);
}

    // 3. Update patient with user reference
    await Patient.findByIdAndUpdate(patient._id, { userId: user._id });

    // 4. Get updated patient for response
    const updatedPatient = await Patient.findById(patient._id);

    // Extended response with authentication info
    return success(
      res,
      {
        patient: updatedPatient,
        authCreated: true,
        credentials: {
          email: user.email,
          defaultPassword: dni,
        },
      },
      MESSAGE_CODES.SUCCESS.PATIENT_CREATED,
      201
    );
  } catch (err) {
    console.error('Error creating patient:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const getAllPatients = async (req, res) => {
  try {
    // Populate user reference (without password for security)
    const patients = await Patient.find({ active: true }).populate('userId', '-password');
    return success(res, patients, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED);
  } catch (err) {
    console.error('Error fetching patients:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ _id: id, active: true });

    if (!patient) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND, 404);
    }

    return success(res, patient, MESSAGE_CODES.SUCCESS.PATIENT_RETRIEVED, 200);
  } catch (err) {
    console.error('Error fetching patient:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      dni,
      imageUrl,
      gender,
      street,
      city,
      postalCode,
      nationality,
      emergencyContact,
    } = req.body;

    // Check if patient exists
    const existingPatient = await Patient.findById(id);
    if (!existingPatient) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND, 404);
    }

    // Update patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birthDate: new Date(birthDate),
        dni: dni.trim(),
        gender,
        street: street.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        nationality,
        emergencyContact: emergencyContact.trim(),
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
      },
      { new: true, runValidators: false }
    );

    return success(res, updatedPatient, MESSAGE_CODES.SUCCESS.PATIENT_UPDATED, 200);
  } catch (err) {
    console.error('Error updating patient:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND, 404);
    }

    // Soft delete - set active to false
    patient.active = false;
    await patient.save();

    return success(res, patient, MESSAGE_CODES.SUCCESS.PATIENT_DELETED, 200);
  } catch (err) {
    console.error('Error deleting patient:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};
