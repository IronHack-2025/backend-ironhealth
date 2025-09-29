import express from 'express';
import { addProfessional, getAllProfessionals, deleteProfessional, getEditProfessional, putEditProfessional } from '../controllers/professionalsControllers.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Solo admins pueden añadir profesionales
router.post('/professionals', verifyToken, requireRole(['admin']), addProfessional);

router.get('/professionals', verifyToken, getAllProfessionals);

router.put('/professionals/:id/delete', verifyToken, requireRole(['admin']), deleteProfessional);

router.get('/professionals/:id/edit', verifyToken, getEditProfessional);

router.put('/professionals/:id/edit', verifyToken, requireRole(['admin']),putEditProfessional);

export default router;