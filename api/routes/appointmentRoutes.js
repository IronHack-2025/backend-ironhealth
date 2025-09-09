// GET Y POST
import express from 'express';
import { postAppointments, getAppointments } from '../controllers/appointmentControllers.js';

const router = express.Router();

router.post('/appointment', postAppointments);
router.get('/appointment', getAppointments);

export default router;