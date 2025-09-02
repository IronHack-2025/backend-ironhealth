import express from 'express';
import { addProfessional } from '../controllers/professionals.js';

const router = express.Router();

router.post('/professionals', addProfessional);

export default router;

