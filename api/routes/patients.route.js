import express from 'express';
import { postNewPatient, getAllPatients } from '../controllers/patients.controller.js';
import { createPatientValidation, validate } from '../validators/patient.validators.js';
import { getSignature } from '../middlewares/getSignature.js';

const router = express.Router();

router.get('/signature', getSignature);

router.post('/patients', createPatientValidation, validate, postNewPatient);

router.get('/patients', getAllPatients);

export default router;
