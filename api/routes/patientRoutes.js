import express from 'express';
import { postNewPatient, getAllPatients, getPatientById } from '../controllers/patientControllers.js';
import { getSignature } from '../middlewares/getSignature.js';

const router = express.Router();

router.get('/signature', getSignature);

router.post('/patients', postNewPatient);

router.get('/patients', getAllPatients);

router.get('/patients/:id', getPatientById);

export default router;