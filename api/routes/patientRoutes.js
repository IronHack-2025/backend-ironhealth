import express from 'express';

const router = express.Router();

router.post('patients', postNewPatient)

export default router;