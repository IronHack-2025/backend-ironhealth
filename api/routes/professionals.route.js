import express from 'express';
import { addProfessional, getAllProfessionals } from '../controllers/professionals.controller.js';
import { createProfessionalValidation, validate } from '../validators/professionals.validators.js';

const router = express.Router();

router.post('/professionals', createProfessionalValidation, validate, addProfessional);

router.get('/professionals', getAllProfessionals);

export default router;
