import { body, validationResult } from 'express-validator';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import Professional from '../models/professionals.model.js';

// Custom validator to check if email already exists
const checkEmailUnique = async email => {
  try {
    const existingProfessional = await Professional.findOne({ email });
    if (existingProfessional) {
      return Promise.reject(VALIDATION_CODES.EMAIL_ALREADY_EXISTS);
    }
  } catch (e) {
    console.error('Error checking email uniqueness:', e);
    return Promise.reject(MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR);
  }
  return Promise.resolve();
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

  body('specialty').optional().isLength({ max: 100 }).withMessage(VALIDATION_CODES.NAME_MIN_LENGTH), // Reusing, but a specific code would be better

  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isEmail()
    .withMessage(VALIDATION_CODES.EMAIL_INVALID_FORMAT)
    .custom(checkEmailUnique),

  body('professionLicenceNumber')
    .optional()
    .isAlphanumeric()
    .withMessage(VALIDATION_CODES.NAME_INVALID_CHARACTERS), // Reusing, but a specific code would be better
];

// Reusable validation error handler
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
