import { Router } from 'express'
import {
  createItem,
  getItems,
  getUserItems,
  getItemById,
  updateItemStatus,
  deleteItemController,
} from '../controllers/itemController.js'
import { verifyAnswers } from '../controllers/claimController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/uploadMiddleware.js'

const router = Router()

// Public-ish routes (still need auth to browse)
router.get('/', authMiddleware, getItems)
router.get('/user/me', authMiddleware, getUserItems)
router.get('/:id', authMiddleware, getItemById)

// Protected routes
router.post('/', authMiddleware, upload.single('image'), createItem)
router.patch('/:id/status', authMiddleware, updateItemStatus)
router.delete('/:id', authMiddleware, deleteItemController)

// Verification
router.post('/:id/verify', authMiddleware, verifyAnswers)

export default router
