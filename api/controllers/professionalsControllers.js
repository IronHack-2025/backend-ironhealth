import Professional from "../models/professionals.model.js";
import validateEmail from "../utils/validateEmail.js";
import getRandomColor from "../utils/assignColor.js";
import { MESSAGE_CODES, VALIDATION_CODES } from "../utils/messageCodes.js";
import { success, error, validationError } from "../middlewares/responseHandler.js";

export const addProfessional = async (req, res) => {
  try {
    const { firstName, lastName, profession, specialty, email, professionLicenceNumber, imageUrl } = req.body || {};

    // 1) Validación acumulando errores
    const validationErrors = [];

    if (!firstName || typeof firstName !== "string") {
      validationErrors.push({
        field: "firstName",
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (!lastName || typeof lastName !== "string") {
      validationErrors.push({
        field: "lastName",
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (firstName && (firstName.trim().length < 2 || firstName.trim().length > 50)) {
      validationErrors.push({
        field: "firstName",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }
    if (lastName && (lastName.trim().length < 2 || lastName.trim().length > 50)) {
      validationErrors.push({
        field: "lastName",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!profession || profession.trim().length < 2) {
      validationErrors.push({
        field: "profession",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2 },
      });
    }

    if (specialty && specialty.length > 100) {
      validationErrors.push({
        field: "specialty",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 0, max: 100 },
      });
    }

    if (!email || !validateEmail(email)) {
      validationErrors.push({
        field: "email",
        code: VALIDATION_CODES.EMAIL_INVALID_FORMAT,
      });
    }

    if (professionLicenceNumber && !/^[a-zA-Z0-9]+$/.test(professionLicenceNumber)) {
      validationErrors.push({
        field: "professionLicenceNumber",
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

    if (validationErrors.length) {
      // 400: devolvemos TODOS los errores de validación
      return validationError(res, validationErrors);
    }

    // Duplicado por email (normalizar a lowercase para consistencia)
    const normalizedEmail = email.toLowerCase().trim();
    const exist = await Professional.exists({ email: normalizedEmail });
    if (exist) {
      return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
    }

    // Crear y responder
    const professionalData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profession: profession.trim(),
      specialty: specialty ? specialty.trim() : "",
      email: normalizedEmail,
      professionLicenceNumber: professionLicenceNumber ? professionLicenceNumber.trim() : "",
      color: getRandomColor(),
    };
    
    if (imageUrl) {
      professionalData.imageUrl = imageUrl;
    }
    
    const newProfessional = new Professional(professionalData);

    const savedProfessional = await newProfessional.save();

    // Éxito con sobre estandarizado
    return success(res, savedProfessional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_CREATED, 201);
  } catch (e) {
    if (e?.code === 11000 && e?.keyPattern?.email) {
      return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
    }

    // Error inesperado
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.find({ active: true }).lean();
    return success(res, professionals, MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalDelete = await Professional.findById(id);

    if (!professionalDelete) {
      return error(res, MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND || "Professional not found", 404);
    }

    professionalDelete.active = !professionalDelete.active;
    await professionalDelete.save();

    return success(res, professionalDelete, MESSAGE_CODES.SUCCESS.PROFESSIONAL_DELETED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const getEditProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalEdit = await Professional.findOne({ _id: id, active: true });
    if (!professionalEdit) {
      return error(res, MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND || "Professional not found", 404);
    }

    return success(res, professionalEdit, MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const putEditProfessional = async (req, res) => {
  try {
    const { id } = req.params; 
    const { firstName, lastName, profession, specialty, email, professionLicenceNumber, imageUrl } = req.body || {};

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

    if (!profession || typeof profession !== "string" || profession.trim().length < 2) {
      validationErrors.push({
        field: "profession",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2 },
      });
    }

    if (specialty && (typeof specialty !== "string" || specialty.length > 100)) {
      validationErrors.push({
        field: "specialty",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 0, max: 100 },
      });
    }

    if (!email || !validateEmail(email)) {
      validationErrors.push({ field: "email", code: VALIDATION_CODES.EMAIL_INVALID_FORMAT });
    }

    if (professionLicenceNumber && !/^[a-zA-Z0-9]+$/.test(professionLicenceNumber)) {
      validationErrors.push({
        field: "professionLicenceNumber",
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

    if (validationErrors.length > 0) {
      return validationError(res, validationErrors, 400);
    }

    const existingProfessional = await Professional.findById(id);
    if (!existingProfessional) {
      return validationError(res, [{ field: "id", code: VALIDATION_CODES.PROFESSIONAL_NOT_FOUND }], 404);
    }

    const emailExists = await Professional.findOne({
      email: email.trim(),
      _id: { $ne: id }, // Excluimos al profesional actual
    });
    if (emailExists) {
      return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
    }

    const updatedProfessional = await Professional.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profession: profession.trim(),
        specialty: specialty ? specialty.trim() : "",
        email: email.trim(),
        professionLicenceNumber: professionLicenceNumber ? professionLicenceNumber.trim() : "",
        ...(imageUrl && { imageUrl: imageUrl.trim() }), 
      },
      { new: true, runValidators: false } 
    );

    return success(res, updatedProfessional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_UPDATED, 200);
  } catch (e) {
    console.error("Error en putEditProfessional:", e);

    if (e?.code === 11000 && e?.keyPattern?.email) {
      return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
    }

    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e.message || "Unexpected error");
  }
};
