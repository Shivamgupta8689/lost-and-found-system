import { db } from '../config/firebase.js'
import { createChat, deleteChatsForItem } from '../services/chatService.js'

// POST /api/items/:id/verify - Verify answers for an item
export const verifyAnswers = async (req, res) => {
  try {
    const { answers } = req.body
    const itemId = req.params.id

    const doc = await db.collection('items').doc(itemId).get()
    if (!doc.exists) {
      return res.status(404).json({ message: 'Item not found' })
    }

    const item = doc.data()

    // Cannot claim your own item
    if (item.finderUid === req.user.uid) {
      return res.status(400).json({ message: 'You cannot claim your own item' })
    }

    if (!answers || answers.length !== item.questions.length) {
      return res.status(400).json({ message: 'Please answer all verification questions' })
    }

    // Compare answers (case-insensitive, trimmed)
    const allCorrect = item.questions.every((q, i) => {
      const userAnswer = (answers[i] || '').trim().toLowerCase()
      const correctAnswer = (q.answer || '').trim().toLowerCase()
      return userAnswer === correctAnswer
    })

    if (allCorrect) {
      // Mark item as claimed
      await db.collection('items').doc(itemId).update({ status: 'claimed' })

      // Delete all chats related to this item
      const deletedCount = await deleteChatsForItem(itemId)
      console.log(`Item ${itemId} claimed. Deleted ${deletedCount} related chat(s).`)

      // Reveal finder contact
      return res.json({
        verified: true,
        finderName: item.finderName,
        finderContact: item.finderContact,
      })
    }

    // Wrong answers - create a chat
    const chat = await createChat({
      itemId,
      itemTitle: item.title,
      finderUid: item.finderUid,
      finderName: item.finderName,
      loserUid: req.user.uid,
      loserName: req.user.name,
    })

    return res.json({
      verified: false,
      chatId: chat.id,
      message: 'Incorrect answers. A chat has been created with the finder.',
    })
  } catch (error) {
    console.error('Verify error:', error.message)
    res.status(500).json({ message: 'Verification failed' })
  }
}
