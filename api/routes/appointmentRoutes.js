import express from 'express';
import { postAppointments, getAppointments, deleteAppointments, cancelAppointments } from '../controllers/appointmentControllers.js';

const router = express.Router();

router.post('/appointment', postAppointments);
router.get('/appointment', getAppointments);
router.delete('/appointment/:id', deleteAppointments);
router.put('/appointment/:id', cancelAppointments)

export default router;