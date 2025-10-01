import { body, param, validationResult } from 'express-validator';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import Patient from '../models/Patient.model.js';
import User from '../models/User.model.js';
import nif_valido from '../utils/validateDNI.js';

// Custom validator to check if email already exists
const checkEmailExists = async value => {
  const existingPatient = await Patient.findOne({ email: value.toLowerCase().trim() });
  if (existingPatient) {
    return Promise.reject(VALIDATION_CODES.EMAIL_ALREADY_EXISTS);
  }

  const existingUser = await User.findOne({ email: value.toLowerCase().trim() });
  if (existingUser) {
    return Promise.reject(VALIDATION_CODES.USER_ALREADY_EXISTS);
  }

  return Promise.resolve();
};

// Custom validator to check if phone already exists
const checkPhoneExists = async value => {
  const existingPatient = await Patient.findOne({ phone: value.trim() });
  if (existingPatient) {
    return Promise.reject(VALIDATION_CODES.PHONE_ALREADY_EXISTS);
  }
  return Promise.resolve();
};

// Custom validator to check if DNI already exists
const checkDniExists = async value => {
  const existingPatient = await Patient.findOne({ dni: value.trim() });
  if (existingPatient) {
    return Promise.reject(VALIDATION_CODES.DNI_ALREADY_EXISTS);
  }
  return Promise.resolve();
};

// Custom validator for DNI format
const validateDNI = value => {
  if (!nif_valido(value)) {
    throw new Error(VALIDATION_CODES.DNI_INVALID_FORMAT);
  }
  return true;
};

// Validation chain for creating a new patient
export const createPatientValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/)
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/)
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isEmail()
    .withMessage(VALIDATION_CODES.EMAIL_INVALID_FORMAT)
    .custom(checkEmailExists),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage(VALIDATION_CODES.PHONE_INVALID_FORMAT)
    .custom(checkPhoneExists),

  body('dni')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .custom(validateDNI)
    .custom(checkDniExists),

  body('birthDate')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isISO8601()
    .withMessage(VALIDATION_CODES.BIRTHDATE_INVALID)
    .custom(value => {
      if (new Date(value) >= new Date()) {
        throw new Error(VALIDATION_CODES.BIRTHDATE_INVALID);
      }
      return true;
    }),

  body('gender')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isIn(['male', 'female', 'non-binary'])
    .withMessage(VALIDATION_CODES.GENDER_INVALID),

  body('street')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2, max: 100 })
    .withMessage(VALIDATION_CODES.STREET_INVALID_FORMAT)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç0-9\s.,ºª'\-/()#]+$/)
    .withMessage(VALIDATION_CODES.STREET_INVALID_FORMAT),

  body('city')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.CITY_INVALID_FORMAT)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s'-]+$/)
    .withMessage(VALIDATION_CODES.CITY_INVALID_FORMAT),

  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .matches(/^\d{5}$/)
    .withMessage(VALIDATION_CODES.POSTAL_CODE_INVALID_FORMAT),

  body('nationality')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NATIONALITY_INVALID)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s-]+$/)
    .withMessage(VALIDATION_CODES.NATIONALITY_INVALID),

  body('emergencyContact')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .matches(/^\+?\d{7,15}$/)
    .withMessage(VALIDATION_CODES.EMERGENCY_CONTACT_INVALID),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage(VALIDATION_CODES.URL_INVALID_FORMAT),
];

// Validation for updating a patient
export const updatePatientValidation = [
  param('id').isMongoId().withMessage(VALIDATION_CODES.ID_INVALID_FORMAT),

  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/)
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/)
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isEmail()
    .withMessage(VALIDATION_CODES.EMAIL_INVALID_FORMAT)
    .custom(async (value, { req }) => {
      const existingPatient = await Patient.findOne({
        email: value.toLowerCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existingPatient) {
        return Promise.reject(VALIDATION_CODES.EMAIL_ALREADY_EXISTS);
      }
      return Promise.resolve();
    }),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .matches(/^\+?\d{7,15}$/)
    .withMessage(VALIDATION_CODES.PHONE_INVALID_FORMAT)
    .custom(async (value, { req }) => {
      const existingPatient = await Patient.findOne({
        phone: value.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingPatient) {
        return Promise.reject(VALIDATION_CODES.PHONE_ALREADY_EXISTS);
      }
      return Promise.resolve();
    }),

  body('dni')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .custom(validateDNI)
    .custom(async (value, { req }) => {
      const existingPatient = await Patient.findOne({
        dni: value.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingPatient) {
        return Promise.reject(VALIDATION_CODES.DNI_ALREADY_EXISTS);
      }
      return Promise.resolve();
    }),

  body('birthDate')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isISO8601()
    .withMessage(VALIDATION_CODES.BIRTHDATE_INVALID)
    .custom(value => {
      if (new Date(value) >= new Date()) {
        throw new Error(VALIDATION_CODES.BIRTHDATE_INVALID);
      }
      return true;
    }),

  body('gender')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isIn(['male', 'female', 'non-binary'])
    .withMessage(VALIDATION_CODES.GENDER_INVALID),

  body('street')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2, max: 100 })
    .withMessage(VALIDATION_CODES.STREET_INVALID_FORMAT)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç0-9\s.,ºª'\-/()#]+$/)
    .withMessage(VALIDATION_CODES.STREET_INVALID_FORMAT),

  body('city')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.CITY_INVALID_FORMAT)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s'-]+$/)
    .withMessage(VALIDATION_CODES.CITY_INVALID_FORMAT),

  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .matches(/^\d{5}$/)
    .withMessage(VALIDATION_CODES.POSTAL_CODE_INVALID_FORMAT),

  body('nationality')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NATIONALITY_INVALID)
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s-]+$/)
    .withMessage(VALIDATION_CODES.NATIONALITY_INVALID),

  body('emergencyContact')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .matches(/^\+?\d{7,15}$/)
    .withMessage(VALIDATION_CODES.EMERGENCY_CONTACT_INVALID),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage(VALIDATION_CODES.URL_INVALID_FORMAT),
];

export const patientIdValidation = [
  param('id').isMongoId().withMessage(VALIDATION_CODES.ID_INVALID_FORMAT),
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
