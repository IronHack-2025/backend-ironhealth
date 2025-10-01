import express from 'express';
import {
  addProfessional,
  getAllProfessionals,
  deleteProfessional,
  getProfessionalById,
  updateProfessional,
} from '../controllers/professionals.controller.js';
import {
  createProfessionalValidation,
  updateProfessionalValidation,
  professionalIdValidation,
  validate,
} from '../validators/professionals.validators.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Only admins can add professionals
router.post(
  '/professionals',
  verifyToken,
  requireRole(['admin']),
  createProfessionalValidation,
  validate,
  addProfessional
);

router.get('/professionals', verifyToken, getAllProfessionals);

router.put(
  '/professionals/:id/delete',
  verifyToken,
  requireRole(['admin']),
  professionalIdValidation,
  validate,
  deleteProfessional
);

router.get(
  '/professionals/:id',
  verifyToken,
  professionalIdValidation,
  validate,
  getProfessionalById
);

router.put(
  '/professionals/:id/edit',
  verifyToken,
  requireRole(['admin']),
  updateProfessionalValidation,
  validate,
  updateProfessional
);

export default router;
