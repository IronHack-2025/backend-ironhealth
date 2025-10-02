import express from 'express';
import { getAllUsers } from '../controllers/users.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.get('/users', verifyToken, requireRole(['admin']), getAllUsers);

export default router;
