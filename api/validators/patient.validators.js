import { body, validationResult } from 'express-validator';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import Patient from '../models/Patient.model.js';

// Custom validator to check if email or phone already exist
const checkExisting = async (value, { _, path }) => {
  try {
    const query = { [path]: value };
    const existingPatient = await Patient.findOne(query);
    if (existingPatient) {
      const errorCode =
        path === 'email'
          ? VALIDATION_CODES.EMAIL_ALREADY_EXISTS
          : VALIDATION_CODES.PHONE_ALREADY_EXISTS;
      return Promise.reject(errorCode);
    }
  } catch (e) {
    // Log the error and let it pass, so it can be caught by a general error handler
    console.error(`Error checking uniqueness for ${path}:`, e);
    return Promise.reject(MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR);
  }
  return Promise.resolve();
};

// Validation chain for creating a new patient
export const createPatientValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/)
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/)
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isEmail()
    .withMessage(VALIDATION_CODES.EMAIL_INVALID_FORMAT)
    .custom(checkExisting),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage(VALIDATION_CODES.PHONE_INVALID_FORMAT)
    .custom(checkExisting),

  body('birthDate')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isISO8601()
    .withMessage(VALIDATION_CODES.DATE_INVALID_FORMAT)
    .custom(value => {
      if (new Date(value) >= new Date()) {
        throw new Error(VALIDATION_CODES.BIRTHDATE_INVALID);
      }
      return true;
    }),

  body('imageUrl').optional().isURL().withMessage(VALIDATION_CODES.URL_INVALID_FORMAT),
];

// Middleware to handle validation errors (can be reused from appointments)
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      code: err.msg,
      meta: err.meta || {},
    }));

    return res.status(400).json({
      success: false,
      message: MESSAGE_CODES.ERROR.VALIDATION_FAILED,
      errors: formattedErrors,
    });
  }
  next();
};
