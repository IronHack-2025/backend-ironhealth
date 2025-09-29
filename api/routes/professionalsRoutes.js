import express from 'express';
import { addProfessional, getAllProfessionals, deleteProfessional, getEditProfessional, putEditProfessional } from '../controllers/professionalsControllers.js';
import { verifyToken, requireRole, requireOwnProfessionalOrAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Solo admins pueden añadir profesionales
router.post('/professionals', verifyToken, requireRole(['admin']), addProfessional);

router.get('/professionals', getAllProfessionals);

router.put('/professionals/:id/delete', deleteProfessional);

router.get('/professionals/:id/edit', getEditProfessional);

router.put('/professionals/:id/edit', putEditProfessional);

export default router;