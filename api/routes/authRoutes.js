import express from 'express';
import { login, changePassword, logout } from '../controllers/authControllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);

router.post('/change-password', verifyToken, changePassword);

router.post('/logout', verifyToken, logout);

export default router;
