import express from 'express';
import { addProfessional, getAllProfessionals, deleteProfessional, getEditProfessional, putEditProfessional } from '../controllers/professionals.controller.js';
import { createProfessionalValidation, editProfessionalValidation, validate } from '../validators/professionals.validators.js';

const router = express.Router();

router.post('/professionals',  verifyToken, requireRole(['admin']),createProfessionalValidation, validate, addProfessional);

router.get('/professionals', verifyToken,getAllProfessionals);

router.put('/professionals/:id/delete', verifyToken, requireRole(['admin']), deleteProfessional);

router.get('/professionals/:id/edit', verifyToken, requireRole(['admin']), getEditProfessional);

router.put('/professionals/:id/edit', verifyToken, requireRole(['admin']), editProfessionalValidation, validate, putEditProfessional);

export default router;
