import { body, validationResult } from 'express-validator';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import User from '../models/User.model.js';

// Custom validator to check if email exists and is active
const checkExisting = async (value, { _, path }) => {
  try {
    const query = { email: value };
    const existingUser = await User.findOne(query);
    if (existingUser) {
      return Promise.reject(VALIDATION_CODES.EMAIL_ALREADY_EXISTS);
    }
  } catch (e) {
  console.error(`Error checking uniqueness for email:`, e);
    return Promise.reject(MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR);
  }
  return Promise.resolve();
};

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage({ code: VALIDATION_CODES.INVALID_EMAIL_FORMAT })
    .custom(checkExisting),
  body('password')
    .isLength({ min: 6 })
    .withMessage({ code: VALIDATION_CODES.PASSWORD_MIN_LENGTH, meta: { min: 6 } }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: MESSAGE_CODES.ERROR.VALIDATION_FAILED,
        errors: errors.array()
      });
    }
    next();
  }
];

export const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage({ code: VALIDATION_CODES.FORM_FIELDS_REQUIRED }),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage({ code: VALIDATION_CODES.PASSWORD_MIN_LENGTH, meta: { min: 6 } }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        code: MESSAGE_CODES.ERROR.VALIDATION_FAILED,
        errors: errors.array()
      });
    }
    next();
  }
];
