import express from 'express';
import { postNewPatient, getAllPatients } from '../controllers/patientControllers.js';

const router = express.Router();

router.post('/patients', postNewPatient)

router.get('/patients', getAllPatients)

export default router;