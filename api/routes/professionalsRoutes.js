import express from 'express';
import { addProfessional, getAllProfessionals } from '../controllers/professionalsControllers.js';

const router = express.Router();

router.post('/professionals', addProfessional);

router.get('/professionals', getAllProfessionals);

export default router;