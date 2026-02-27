import { Router } from 'express'
import { getUserChats, getChatById, getChatMessages } from '../controllers/chatController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, getUserChats)
router.get('/:chatId', authMiddleware, getChatById)
router.get('/:chatId/messages', authMiddleware, getChatMessages)

export default router
