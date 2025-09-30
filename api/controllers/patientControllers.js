import Patient from "../models/Patient.model.js";
import validateEmail from "../utils/validateEmail.js";
import nif_valido from "../utils/validateDNI.js";
import User from "../models/User.model.js";
import { MESSAGE_CODES, VALIDATION_CODES } from "../utils/messageCodes.js";
import { success, error, validationError } from "../middlewares/responseHandler.js";

export const postNewPatient = async (req, res) => {
  const { firstName, lastName, email, phone, birthDate, imageUrl, dni,
    gender,
    street,
    city,
    postalCode,
    nationality,
    emergencyContact, } = req.body;

  const validationErrors = [];

  if (!req.body) {
    return validationError(res, [{ field: "body", code: VALIDATION_CODES.FORM_FIELDS_REQUIRED }]);
  }

  if (typeof firstName !== "string" || typeof lastName !== "string") {
    validationErrors.push({ field: "firstName", code: VALIDATION_CODES.NAME_MUST_BE_STRING });
    validationErrors.push({ field: "lastName", code: VALIDATION_CODES.NAME_MUST_BE_STRING });
  }

  if (firstName && firstName.length <= 2) {
    validationErrors.push({ field: "firstName", code: VALIDATION_CODES.NAME_MIN_LENGTH });
  }

  if (lastName && lastName.length <= 2) {
    validationErrors.push({ field: "lastName", code: VALIDATION_CODES.NAME_MIN_LENGTH });
  }

  if (firstName && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(firstName)) {
    validationErrors.push({ field: "firstName", code: VALIDATION_CODES.NAME_INVALID_CHARACTERS });
  }

  if (lastName && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(lastName)) {
    validationErrors.push({ field: "lastName", code: VALIDATION_CODES.NAME_INVALID_CHARACTERS });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    validationErrors.push({ field: "email", code: VALIDATION_CODES.EMAIL_INVALID_FORMAT });
  }
  if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
    validationErrors.push({ field: "phone", code: VALIDATION_CODES.PHONE_INVALID_FORMAT });
  }
  if (!nif_valido(dni)) {
    validationErrors.push({ field: "dni", code: VALIDATION_CODES.DNI_INVALID_FORMAT });
  }
  // Verificar si el email ya existe
  if (!['male', 'female', 'non-binary'].includes(gender)) {
    validationErrors.push({ field: 'gender', code: VALIDATION_CODES.GENDER_INVALID });
  }

  // Validate street (more flexible - letters, numbers, spaces, common punctuation)
  if (typeof street !== 'string' || street.trim().length < 2 || street.trim().length > 100 ||
    !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç0-9\s.,ºª'\-\/()#]+$/.test(street.trim())) {
    validationErrors.push({ field: 'street', code: VALIDATION_CODES.STREET_INVALID_FORMAT });
  }
  if (typeof city !== 'string' || city.trim().length < 2 || city.trim().length > 50 ||
    !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s'\-]+$/.test(city.trim())) {
    validationErrors.push({ field: 'city', code: VALIDATION_CODES.CITY_INVALID_FORMAT });
  }

  // Validate postalCode (Spain 5 digits; change if needed)
  if (typeof postalCode !== 'string' || !/^\d{5}$/.test(postalCode.trim())) {
    validationErrors.push({ field: 'postalCode', code: VALIDATION_CODES.POSTAL_CODE_INVALID_FORMAT });
  }

  // Validate nationality
  if (nationality && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s\-]+$/.test(nationality)) {
    validationErrors.push({ field: 'nationality', code: VALIDATION_CODES.NATIONALITY_INVALID });
  }
  // Validate emergencyContact
  if (!/^\+?\d{7,15}$/.test(emergencyContact)) {
    validationErrors.push({ field: 'emergencyContact', code: VALIDATION_CODES.EMERGENCY_CONTACT_INVALID });
  }

  try {
    const existingEmail = await Patient.findOne({ email });
    if (existingEmail) {
      validationErrors.push({ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS });
    }

    const existingPhone = await Patient.findOne({ phone });
    if (existingPhone) {
      validationErrors.push({ field: "phone", code: VALIDATION_CODES.PHONE_ALREADY_EXISTS });
    }

    const existingDni = await Patient.findOne({ dni });
    if (existingDni) {
      validationErrors.push({ field: "dni", code: VALIDATION_CODES.DNI_ALREADY_EXISTS }); // Reutilizamos código
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      validationErrors.push({ field: "email", code: VALIDATION_CODES.USER_ALREADY_EXISTS });
    }
  } catch (err) {
    console.error("Error checking existing records:", err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR);
  }

  const today = new Date();
  if (birthDate >= today) {
    validationErrors.push({ field: "birthDate", code: VALIDATION_CODES.BIRTHDATE_INVALID });
  }

  // Si hay errores de validación, devolverlos todos
  if (validationErrors.length > 0) {
    return validationError(res, validationErrors);
  }

  try {
    // 1. Crear el paciente sin userId primero
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

    // 2. Crear usuario automáticamente - El middleware del modelo se encarga del hash
    console.log(`🔑 Creating user with password: ${dni}`);

    const user = new User({
      email,
      password: dni, // Sin hashear, que lo haga el middleware
      role: "patient",
      profileId: patient._id,
      profileModel: "Patient",
    });
    await user.save();
    console.log(`✅ User created with email: ${email}`);
    // 3. Actualizar paciente con referencia al usuario
    await Patient.findByIdAndUpdate(patient._id, { userId: user._id });

    // 4. Obtener paciente actualizado para la respuesta
    const updatedPatient = await Patient.findById(patient._id);

    // Respuesta extendida con info de autenticación
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
    console.error("Error creating patient:", err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const getAllPatients = async (req, res) => {
  try {
    // Populate completo del usuario asociado (sin password por seguridad)
    const patients = await Patient.find({ active: true }).populate("userId", "-password");
    return success(res, patients, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED);
  } catch (err) {
    console.error("Error fetching patients:", err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientDelete = await Patient.findById(id);

    if (!patientDelete) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND || "Patient not found", 404);
    }
    patientDelete.active = false;
    await patientDelete.save();

    return success(res, patientDelete, MESSAGE_CODES.SUCCESS.PATIENT_DELETED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND, 404, 'Patient not found');
    }
    return success(res, patient, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED);
  } catch (err) {
    console.error('Error fetching patient by ID:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
}

export const getEditPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientEdit = await Patient.findOne({ _id: id, active: true });
    if (!patientEdit) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND || "Patient not found", 404);
    }

    return success(res, patientEdit, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const putEditPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, birthDate, dni, imageUrl } = req.body || {};

    const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
    if (!id || !isValidObjectId(id)) {
      return validationError(res, [{ field: "id", code: VALIDATION_CODES.INVALID_ID }], 400);
    }

    const validationErrors = [];

    if (!firstName || typeof firstName !== "string") {
      validationErrors.push({ field: "firstName", code: VALIDATION_CODES.NAME_MUST_BE_STRING });
    } else if (firstName.trim().length < 2 || firstName.trim().length > 50) {
      validationErrors.push({
        field: "firstName",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!lastName || typeof lastName !== "string") {
      validationErrors.push({ field: "lastName", code: VALIDATION_CODES.NAME_MUST_BE_STRING });
    } else if (lastName.trim().length < 2 || lastName.trim().length > 50) {
      validationErrors.push({
        field: "lastName",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!email || !validateEmail(email)) {
      validationErrors.push({ field: "email", code: VALIDATION_CODES.EMAIL_INVALID_FORMAT });
    }
    if (!dni || !nif_valido(dni)) {
      validationErrors.push({ field: "dni", code: VALIDATION_CODES.DNI_INVALID_FORMAT });
    }

    if (!phone || !/^\+?\d{7,15}$/.test(phone)) {
      validationErrors.push({ field: "phone", code: VALIDATION_CODES.PHONE_INVALID_FORMAT });
    }

    if (!birthDate) {
      validationErrors.push({ field: "birthDate", code: VALIDATION_CODES.BIRTHDATE_REQUIRED || "BIRTHDATE_REQUIRED" });
    } else {
      const birthDateObj = new Date(birthDate);
      const today = new Date();
      if (isNaN(birthDateObj.getTime()) || birthDateObj >= today) {
        validationErrors.push({ field: "birthDate", code: VALIDATION_CODES.BIRTHDATE_INVALID });
      }
    }

    if (validationErrors.length > 0) {
      return validationError(res, validationErrors, 400);
    }

    const existingPatient = await Patient.findById(id);
    if (!existingPatient) {
      return validationError(res, [{ field: "id", code: VALIDATION_CODES.PATIENT_NOT_FOUND }], 404);
    }

    const emailExists = await Patient.findOne({
      email: email.trim().toLowerCase(),
      _id: { $ne: id }, // ← Excluir al paciente actual
    });
    if (emailExists) {
      return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
    }


    const existingDni = await Patient.findOne({
      dni: dni.trim(),
      _id: { $ne: id }, // Excluimos al paciente actual
    });


    if (existingDni) {
      return validationError(res, [{ field: "dni", code: VALIDATION_CODES.DNI_ALREADY_EXISTS }], 409);
    }

    const phoneExists = await Patient.findOne({
      phone: phone.trim(),
      _id: { $ne: id }, // Excluimos al paciente actual
    });
    if (phoneExists) {
      return validationError(res, [{ field: "phone", code: VALIDATION_CODES.PHONE_ALREADY_EXISTS }], 409);
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birthDate: new Date(birthDate),
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
      },
      { new: true, runValidators: false }
    );

    return success(res, updatedPatient, MESSAGE_CODES.SUCCESS.PATIENT_UPDATED, 200);
  } catch (e) {
    console.error("Error en putEditPatient:", e);

    if (e?.code === 11000) {
      if (e?.keyPattern?.email) {
        return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
      }
      if (e?.keyPattern?.phone) {
        return validationError(res, [{ field: "phone", code: VALIDATION_CODES.PHONE_ALREADY_EXISTS }], 409);
      }
    }

    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e.message || "Unexpected error");
  }
};
