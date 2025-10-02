import express from 'express';
import { login, changePassword, logout } from '../controllers/auth.controller.js';
import {
  loginValidation,
  changePasswordValidation,
  validate,
} from '../validators/auth.validators.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/auth/login', loginValidation, validate, login);

router.post(
  '/auth/change-password',
  verifyToken,
  changePasswordValidation,
  validate,
  changePassword
);

router.post('/auth/logout', verifyToken, logout);

export default router;
