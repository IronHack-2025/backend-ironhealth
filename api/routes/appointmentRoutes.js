import express from 'express';
import { postAppointments, getAppointments, deleteAppointments, cancelAppointments } from '../controllers/appointmentControllers.js';
import { validateNotes } from '../middlewares/validateNotes.js';

const router = express.Router();

router.post('/appointment', validateNotes, postAppointments);
router.get('/appointment', getAppointments);
router.delete('/appointment/:id', deleteAppointments);
router.put('/appointment/:id', cancelAppointments);

export default router;