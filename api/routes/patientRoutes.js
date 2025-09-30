import express from 'express';
import { postNewPatient, getAllPatients, deletePatient, getEditPatient, putEditPatient, getPatientById } from '../controllers/patientControllers.js';
import { getSignature } from '../middlewares/getSignature.js';
import { verifyToken, requireRole, requireOwnPatientOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/signature', getSignature);

// Solo admins y profesionales pueden crear y ver pacientes
router.post('/patients', verifyToken, requireRole(['admin', 'professional']), postNewPatient);

router.get('/patients', verifyToken, requireRole(['admin', 'professional']), getAllPatients);

router.put('/patients/:id/delete', verifyToken, requireRole(['admin', 'professional']),deletePatient);

router.get('/patients/:id/edit', verifyToken, getEditPatient);

router.put('/patients/:id/edit', verifyToken, requireRole(['admin', 'professional']),putEditPatient);

router.get('/patients/:id', getPatientById);

export default router;