import express from 'express';
import { postNewEmail } from '../controllers/newsletter.js';

const router = express.Router();

router.post('/newsletter', postNewEmail);

export default router;

