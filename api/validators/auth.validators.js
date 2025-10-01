import { body, validationResult } from 'express-validator';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';

// Validation for login
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isEmail()
    .withMessage(VALIDATION_CODES.EMAIL_INVALID_FORMAT),

  body('password').notEmpty().withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED),
];

// Validation for change password
export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED),

  body('newPassword')
    .notEmpty()
    .withMessage(VALIDATION_CODES.FORM_FIELDS_REQUIRED)
    .isLength({ min: 6 })
    .withMessage(VALIDATION_CODES.PASSWORD_MIN_LENGTH),
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
