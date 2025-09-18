import express from 'express';
import { postNewPatient, getAllPatients } from '../controllers/patientControllers.js';
import { getSignature } from '../middlewares/getSignature.js';

const router = express.Router();

router.get('/signature', getSignature);

router.post('/patients', postNewPatient);

router.get('/patients', getAllPatients);

export default router;