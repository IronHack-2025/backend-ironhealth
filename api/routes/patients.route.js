import express from 'express';
import { createPatientValidation, validate, editPatientValidation } from '../validators/patient.validators.js';
import { postNewPatient, getAllPatients, deletePatient,  putEditPatient, getPatientById } from '../controllers/patientControllers.js';
import { getSignature } from '../middlewares/getSignature.js';
import { verifyToken, requireRole, requireOwnPatientOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/signature', getSignature);

router.post('/patients',  verifyToken, requireRole(['admin', 'professional']),createPatientValidation, validate, postNewPatient);

router.get('/patients', verifyToken, requireRole(['admin', 'professional']), getAllPatients);

router.put('/patients/:id/delete', verifyToken, requireRole(['admin', 'professional']),deletePatient);

router.put('/patients/:id/edit', verifyToken, requireRole(['admin', 'professional']),editPatientValidation, validate, putEditPatient);

router.get('/patients/:id', verifyToken, requireOwnPatientOrAdmin, getPatientById);

export default router;
