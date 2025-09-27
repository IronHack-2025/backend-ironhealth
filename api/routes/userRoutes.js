import express from 'express';
import { getAllUsers } from '../controllers/usersControllers.js';

const router = express.Router();

router.get('/users', getAllUsers);

export default router;