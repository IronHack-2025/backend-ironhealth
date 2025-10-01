import { body, param, validationResult } from 'express-validator';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import Professional from '../models/professionals.model.js';
import User from '../models/User.model.js';
import nif_valido from '../utils/validateDNI.js';

// Custom validator to check if email already exists
const checkEmailExists = async value => {
  const existingProfessional = await Professional.findOne({ email: value.toLowerCase().trim() });
  if (existingProfessional) {
    return Promise.reject(VALIDATION_CODES.EMAIL_ALREADY_EXISTS);
  }

  const existingUser = await User.findOne({ email: value.toLowerCase().trim() });
  if (existingUser) {
    return Promise.reject(VALIDATION_CODES.USER_ALREADY_EXISTS);
  }

  return Promise.resolve();
};

// Custom validator to check if DNI already exists
const checkDniExists = async value => {
  const existingProfessional = await Professional.findOne({ dni: value.trim() });
  if (existingProfessional) {
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

// Validation chain for creating a new professional
export const createProfessionalValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH),

  body('profession')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH),

  body('specialty')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH), // Reusing, but a specific code would be better

  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isEmail()
    .withMessage(VALIDATION_CODES.EMAIL_INVALID_FORMAT)
    .custom(checkEmailExists),

  body('dni')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .custom(validateDNI)
    .custom(checkDniExists),

  body('professionLicenceNumber')
    .optional({ checkFalsy: true })
    .isAlphanumeric()
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage(VALIDATION_CODES.URL_INVALID_FORMAT),
];

// Validation for updating a professional
export const updateProfessionalValidation = [
  param('id').isMongoId().withMessage(VALIDATION_CODES.ID_INVALID_FORMAT),

  body('firstName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH),

  body('lastName')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ min: 2, max: 50 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH),

  body('profession')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 2 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH),

  body('specialty')
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage(VALIDATION_CODES.NAME_MIN_LENGTH),

  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isEmail()
    .withMessage(VALIDATION_CODES.EMAIL_INVALID_FORMAT)
    .custom(async (value, { req }) => {
      const existingProfessional = await Professional.findOne({
        email: value.toLowerCase().trim(),
        _id: { $ne: req.params.id },
      });
      if (existingProfessional) {
        return Promise.reject(VALIDATION_CODES.EMAIL_ALREADY_EXISTS);
      }
      return Promise.resolve();
    }),

  body('dni')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .custom(validateDNI)
    .custom(async (value, { req }) => {
      const existingProfessional = await Professional.findOne({
        dni: value.trim(),
        _id: { $ne: req.params.id },
      });
      if (existingProfessional) {
        return Promise.reject(VALIDATION_CODES.DNI_ALREADY_EXISTS);
      }
      return Promise.resolve();
    }),

  body('professionLicenceNumber')
    .optional({ checkFalsy: true })
    .isAlphanumeric()
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS),

  body('professionalNotes')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage(VALIDATION_CODES.NAME_MUST_BE_STRING)
    .isLength({ max: 1000 })
    .withMessage(VALIDATION_CODES.NOTES_MAX_LENGTH)
    .trim()
    .escape(),

  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage(VALIDATION_CODES.URL_INVALID_FORMAT),
];

export const professionalIdValidation = [
  param('id').isMongoId().withMessage(VALIDATION_CODES.ID_INVALID_FORMAT),
];

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
