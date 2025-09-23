import express from 'express';
import { addProfessional, getAllProfessionals, deleteProfessional, editProfessional } from '../controllers/professionalsControllers.js';

const router = express.Router();

router.post('/professionals', addProfessional);

router.get('/professionals', getAllProfessionals);

router.put('/professionals/:id/delete', deleteProfessional);

router.get('/professionals/:id/edit', editProfessional);

export default router;