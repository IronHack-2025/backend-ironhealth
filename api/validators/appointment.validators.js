import { body, param, validationResult } from 'express-validator';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import sanitizeHtml from 'sanitize-html';

// Common validation rules
const idValidation = param('id').trim().isMongoId().withMessage(VALIDATION_CODES.ID_INVALID_FORMAT);

// This replaced the valideNotes.js, I just moved the logic here.
const notesSanitization = value => {
  if (!value) return value;

  const sanitized = sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });

  if (value !== sanitized) {
    throw new Error(VALIDATION_CODES.NOTES_HTML_NOT_ALLOWED);
  }

  if (sanitized.length > 500) {
    throw new Error(VALIDATION_CODES.NOTES_TOO_LONG);
  }

  return sanitized;
};

// Validation chains
export const createAppointmentValidation = [
  body('professionalId')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isMongoId()
    .withMessage(VALIDATION_CODES.ID_INVALID_FORMAT),

  body('patientId')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isMongoId()
    .withMessage(VALIDATION_CODES.ID_INVALID_FORMAT),

  body('startDate')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isISO8601()
    .withMessage(VALIDATION_CODES.DATE_INVALID_FORMAT)
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error(VALIDATION_CODES.DATE_MUST_BE_FUTURE);
      }
      return true;
    }),

  body('endDate')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isISO8601()
    .withMessage(VALIDATION_CODES.DATE_INVALID_FORMAT)
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error(VALIDATION_CODES.END_DATE_AFTER_START);
      }
      return true;
    }),

  body('notes').optional({ checkFalsy: true }).customSanitizer(notesSanitization),
];

export const updateAppointmentNotesValidation = [
  idValidation,
  body('notes')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .customSanitizer(notesSanitization),
];

export const appointmentIdValidation = [idValidation];

// Middleware to handle validation errors
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
