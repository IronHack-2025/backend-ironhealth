import express from 'express';
import { postNewPatient } from '../controllers/patientControllers.js';

const router = express.Router();

router.post('patients', postNewPatient)

export default router;