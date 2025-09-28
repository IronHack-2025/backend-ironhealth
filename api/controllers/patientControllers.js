import Patient from "../models/patient.model.js";
import { MESSAGE_CODES, VALIDATION_CODES } from "../utils/messageCodes.js";
import { success, error, validationError } from "../middlewares/responseHandler.js";

export const postNewPatient = async (req, res) => {
  const { firstName, lastName, email, phone, birthDate, imageUrl } = req.body;

  const validationErrors = [];

  if (!req.body) {
    return validationError(res, [
      { field: "body", code: VALIDATION_CODES.FORM_FIELDS_REQUIRED },
    ]);
  }

  if (typeof firstName !== "string" || typeof lastName !== "string") {
    validationErrors.push({
      field: "firstName",
      code: VALIDATION_CODES.NAME_MUST_BE_STRING,
    });
    validationErrors.push({
      field: "lastName",
      code: VALIDATION_CODES.NAME_MUST_BE_STRING,
    });
  }

  if (firstName && firstName.length <= 2) {
    validationErrors.push({
      field: "firstName",
      code: VALIDATION_CODES.NAME_MIN_LENGTH,
    });
  }

  if (lastName && lastName.length <= 2) {
    validationErrors.push({
      field: "lastName",
      code: VALIDATION_CODES.NAME_MIN_LENGTH,
    });
  }

  if (firstName && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(firstName)) {
    validationErrors.push({
      field: "firstName",
      code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
    });
  }

  if (lastName && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(lastName)) {
    validationErrors.push({
      field: "lastName",
      code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    validationErrors.push({
      field: "email",
      code: VALIDATION_CODES.EMAIL_INVALID_FORMAT,
    });
  }
  if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
    validationErrors.push({
      field: "phone",
      code: VALIDATION_CODES.PHONE_INVALID_FORMAT,
    });
  }
  // Verificar si el email ya existe
  try {
    const existingEmail = await Patient.findOne({ email });
    if (existingEmail) {
      validationErrors.push({
        field: "email",
        code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS,
      });
    }

    const existingPhone = await Patient.findOne({ phone });
    if (existingPhone) {
      validationErrors.push({
        field: "phone",
        code: VALIDATION_CODES.PHONE_ALREADY_EXISTS,
      });
    }
  } catch (err) {
    console.error("Error checking existing records:", err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR);
  }

  const today = new Date();
  if (birthDate >= today) {
    validationErrors.push({
      field: "birthDate",
      code: VALIDATION_CODES.BIRTHDATE_INVALID,
    });
  }

  // Si hay errores de validación, devolverlos todos
  if (validationErrors.length > 0) {
    return validationError(res, validationErrors);
  }

  try {
    const patientData = {
      firstName,
      lastName,
      email,
      phone,
      birthDate,
    };

    if (imageUrl) {
      patientData.imageUrl = imageUrl;
    }

    const patient = await Patient.create(patientData);
    console.log(`Patient added successfully: ${patient}`);

    /**
     * HOOK de email de bienvenida (NO bloqueante)
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

      const portalUrl = process.env.PORTAL_URL;

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

    // Respondemos al cliente (201 Created) — el envío de email sigue por detrás
    return success(res, patient, MESSAGE_CODES.SUCCESS.PATIENT_CREATED, 201);
  } catch (err) {
    console.error("Error creating patient:", err);
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      err.message
    );
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find();
    return success(res, patients, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED);
  } catch (err) {
    console.error("Error fetching patients:", err);
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      err.message
    );
  }
};
