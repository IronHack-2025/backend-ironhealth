import express from 'express';
import { 
    login, 
    changePassword, 
    logout,
 } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.js';
import { validateLogin } from '../validators/auth.validators.js';

const router = express.Router();

router.post('/login', validateLogin, checkExisting, login);

router.post('/change-password', verifyToken, validateChangePassword, changePassword);

router.post('/logout', verifyToken, logout);

export default router;