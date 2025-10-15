import express from 'express';
import {
  postNewPatient,
  getAllPatients,
  deletePatient,
  updatePatient,
  getPatientById,
} from '../controllers/patients.controller.js';
import {
  createPatientValidation,
  updatePatientValidation,
  patientIdValidation,
  validate,
} from '../validators/patient.validators.js';
import { postSignature } from '../middlewares/postSignature.js';
import { verifyToken, requireRole, requireOwnPatientOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signature', express.urlencoded({ extended: true }), express.json(), postSignature);

// Only admins and professionals can create and view patients
router.post(
  '/patients',
  verifyToken,
  requireRole(['admin', 'professional']),
  createPatientValidation,
  validate,
  postNewPatient
);

router.get('/patients', verifyToken, requireRole(['admin', 'professional']), getAllPatients);

router.put(
  '/patients/:id/delete',
  verifyToken,
  requireRole(['admin', 'professional']),
  patientIdValidation,
  validate,
  deletePatient
);

router.put(
  '/patients/:id/edit',
  verifyToken,
  requireRole(['admin', 'professional']),
  updatePatientValidation,
  validate,
  updatePatient
);

router.get(
  '/patients/:id',
  verifyToken,
  requireOwnPatientOrAdmin,
  patientIdValidation,
  validate,
  getPatientById
);

export default router;
