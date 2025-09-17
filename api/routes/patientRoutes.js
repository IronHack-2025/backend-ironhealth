import express from 'express';
import { postNewPatient, getAllPatients } from '../controllers/patientControllers.js';
import { upload, uploadToCloudinary } from '../middlewares/uploadMiddleware.js';
const router = express.Router();

router.post('/patients', upload.single('image'), uploadToCloudinary, postNewPatient);

router.get('/patients', getAllPatients)

export default router;