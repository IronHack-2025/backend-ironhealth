import express from 'express';
import { postNewPatient, getAllPatients, deletePatient, getEditPatient, putEditPatient } from '../controllers/patientControllers.js';
import { getSignature } from '../middlewares/getSignature.js';

const router = express.Router();

router.get('/signature', getSignature);

router.post('/patients', postNewPatient);

router.get('/patients', getAllPatients);

router.put('/patients/:id/delete', deletePatient);

router.get('/patients/:id/edit', getEditPatient);

router.put('/patients/:id/edit', putEditPatient);

export default router;