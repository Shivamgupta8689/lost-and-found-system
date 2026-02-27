import { db } from '../config/firebase.js'

// GET /api/chats - Get all chats for current user
export const getUserChats = async (req, res) => {
  try {
    const uid = req.user.uid

    // Get chats where user is finder OR loser
    const [finderChats, loserChats] = await Promise.all([
      db.collection('chats').where('finderUid', '==', uid).get(),
      db.collection('chats').where('loserUid', '==', uid).get(),
    ])

    const chats = []

    const processDoc = (doc) => {
      const data = doc.data()
      chats.push({
        id: doc.id,
        itemId: data.itemId,
        itemTitle: data.itemTitle,
        finderUid: data.finderUid,
        finderName: data.finderName,
        loserUid: data.loserUid,
        loserName: data.loserName,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
      })
    }

    finderChats.forEach(processDoc)
    loserChats.forEach(processDoc)

    // Sort by last message time (newest first)
    chats.sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return timeB - timeA
    })

    res.json({ chats })
  } catch (error) {
    console.error('Get chats error:', error.message)
    res.status(500).json({ message: 'Failed to fetch chats' })
  }
}

// GET /api/chats/:chatId - Get a single chat
export const getChatById = async (req, res) => {
  try {
    const chatDoc = await db.collection('chats').doc(req.params.chatId).get()
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    const data = chatDoc.data()

    // Only participants can access
    if (data.finderUid !== req.user.uid && data.loserUid !== req.user.uid) {
      return res.status(403).json({ message: 'You are not a participant in this chat' })
    }

    res.json({
      chat: {
        id: chatDoc.id,
        itemId: data.itemId,
        itemTitle: data.itemTitle,
        finderUid: data.finderUid,
        finderName: data.finderName,
        loserUid: data.loserUid,
        loserName: data.loserName,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
      },
    })
  } catch (error) {
    console.error('Get chat error:', error.message)
    res.status(500).json({ message: 'Failed to fetch chat' })
  }
}

// GET /api/chats/:chatId/messages - Get messages for a chat
export const getChatMessages = async (req, res) => {
  try {
    // Verify participant
    const chatDoc = await db.collection('chats').doc(req.params.chatId).get()
    if (!chatDoc.exists) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    const chatData = chatDoc.data()
    if (chatData.finderUid !== req.user.uid && chatData.loserUid !== req.user.uid) {
      return res.status(403).json({ message: 'You are not a participant in this chat' })
    }

    const snapshot = await db.collection('chats').doc(req.params.chatId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get()

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        senderUid: data.senderUid,
        senderName: data.senderName,
        text: data.text,
        createdAt: data.createdAt?.toDate?.() || null,
      }
    })

    res.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error.message)
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
}
