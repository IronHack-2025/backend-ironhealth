import express from 'express';
import { login, changePassword } from '../controllers/authControllers.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);

router.put('/change-password', verifyToken, changePassword);

export default router;