import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { sendEmailController } from '../controllers/emailController.js'

const router = Router()

// Limitamos 20 peticiones por IP cada 15 minutos (ajusta según necesidad)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,                  // 20 peticiones por IP/ventana
  standardHeaders: true,
  legacyHeaders: false
})

// POST /api/sendEmail
router.post('/sendEmail', limiter, sendEmailController)

export default router
