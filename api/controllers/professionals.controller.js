import Professional from '../models/professionals.model.js';
import validateEmail from '../utils/validateEmail.js';
import getRandomColor from '../utils/assignColor.js';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import { success, error, validationError } from '../middlewares/responseHandler.js';

export const addProfessional = async (req, res) => {
  try {
    const { firstName, lastName, profession, specialty, email, professionLicenceNumber } =
      req.body || {};

    // 1) Validación acumulando errores
    const validationErrors = [];

    if (!firstName || typeof firstName !== 'string') {
      validationErrors.push({
        field: 'firstName',
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (!lastName || typeof lastName !== 'string') {
      validationErrors.push({
        field: 'lastName',
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (firstName && (firstName.trim().length < 2 || firstName.trim().length > 50)) {
      validationErrors.push({
        field: 'firstName',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }
    if (lastName && (lastName.trim().length < 2 || lastName.trim().length > 50)) {
      validationErrors.push({
        field: 'lastName',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!profession || profession.trim().length < 2) {
      validationErrors.push({
        field: 'profession',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2 },
      });
    }

    if (specialty && specialty.length > 100) {
      validationErrors.push({
        field: 'specialty',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 0, max: 100 },
      });
    }

    if (!email || !validateEmail(email)) {
      validationErrors.push({
        field: 'email',
        code: VALIDATION_CODES.EMAIL_INVALID_FORMAT,
      });
    }

    if (professionLicenceNumber && !/^[a-zA-Z0-9]+$/.test(professionLicenceNumber)) {
      validationErrors.push({
        field: 'professionLicenceNumber',
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

    if (validationErrors.length) {
      // 400: devolvemos TODOS los errores de validación
      return validationError(res, validationErrors);
    }

    // Duplicado por email
    const exist = await Professional.exists({ email });
    if (exist) {
      return validationError(
        res,
        [{ field: 'email', code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }],
        409
      );
    }

    // Crear y responder
    const newProfessional = new Professional({
      firstName,
      lastName,
      profession,
      specialty,
      email,
      professionLicenceNumber,
      color: getRandomColor(),
    });

    const savedProfessional = await newProfessional.save();

    // Éxito con sobre estandarizado
    return success(res, savedProfessional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_CREATED, 201);
  } catch (e) {
    if (e?.code === 11000 && e?.keyPattern?.email) {
      return validationError(
        res,
        [{ field: 'email', code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }],
        409
      );
    }

    // Error inesperado
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.find().lean();
    // Devolvemos éxito con sobre estandarizado
    return success(res, professionals, MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};
