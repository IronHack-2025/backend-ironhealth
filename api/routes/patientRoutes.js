import express from 'express';
import { postNewPatient, getAllPatients, deletePatient, getEditPatient, putEditPatient } from '../controllers/patientControllers.js';
import { getSignature } from '../middlewares/getSignature.js';
import { verifyToken, requireRole, requireOwnPatientOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/signature', getSignature);

// Solo admins y profesionales pueden crear y ver pacientes
router.post('/patients', verifyToken, requireRole(['admin', 'professional']), postNewPatient);

router.get('/patients', verifyToken, requireRole(['admin', 'professional']), getAllPatients);

router.put('/patients/:id/delete', deletePatient);

router.get('/patients/:id/edit', getEditPatient);

router.put('/patients/:id/edit', putEditPatient);

export default router;