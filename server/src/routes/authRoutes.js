import { Router } from 'express'
import { registerUser, getMe } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', authMiddleware, registerUser)
router.get('/me', authMiddleware, getMe)

export default router
