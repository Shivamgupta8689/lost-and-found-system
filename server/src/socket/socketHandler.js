import { authAdmin, db } from '../config/firebase.js'
import { addMessage, getChatParticipants } from '../services/chatService.js'

export const initializeSocket = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) {
        return next(new Error('Authentication required'))
      }
      const decoded = await authAdmin.verifyIdToken(token)

      // Fetch user name from Firestore
      const userDoc = await db.collection('users').doc(decoded.uid).get()
      const userData = userDoc.exists ? userDoc.data() : {}

      socket.user = {
        uid: decoded.uid,
        email: decoded.email,
        name: userData.name || decoded.name || decoded.email?.split('@')[0] || 'User',
      }
      next()
    } catch (error) {
      console.error('Socket auth error:', error.message)
      next(new Error('Invalid authentication token'))
    }
  })

  io.on('connection', (socket) => {
    // console.log(`User connected: ${socket.user.uid} (${socket.user.name})`)

    // Join a chat room
    socket.on('join-chat', async ({ chatId }) => {
      try {
        const participants = await getChatParticipants(chatId)
        if (!participants) {
          socket.emit('error', { message: 'Chat not found' })
          return
        }

        // Only allow participants
        if (participants.finderUid !== socket.user.uid && participants.loserUid !== socket.user.uid) {
          socket.emit('error', { message: 'You are not a participant in this chat' })
          return
        }

        socket.join(chatId)
        // console.log(`${socket.user.name} joined chat: ${chatId}`)
      } catch (error) {
        console.error('Join chat error:', error.message)
        socket.emit('error', { message: 'Failed to join chat' })
      }
    })

    // Leave a chat room
    socket.on('leave-chat', ({ chatId }) => {
      socket.leave(chatId)
    })

    // Send a message
    socket.on('send-message', async ({ chatId, text }) => {
      try {
        if (!text || !text.trim()) return

        const participants = await getChatParticipants(chatId)
        if (!participants) {
          socket.emit('error', { message: 'Chat not found' })
          return
        }

        if (participants.finderUid !== socket.user.uid && participants.loserUid !== socket.user.uid) {
          socket.emit('error', { message: 'You are not a participant in this chat' })
          return
        }

        const message = await addMessage(chatId, {
          senderUid: socket.user.uid,
          senderName: socket.user.name,
          text: text.trim(),
        })

        // Emit to all users in the room (including sender)
        io.to(chatId).emit('new-message', message)
      } catch (error) {
        console.error('Send message error:', error.message)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Typing indicators
    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('user-typing', {
        uid: socket.user.uid,
        name: socket.user.name,
      })
    })

    socket.on('stop-typing', ({ chatId }) => {
      socket.to(chatId).emit('user-stop-typing', {
        uid: socket.user.uid,
      })
    })

    socket.on('disconnect', () => {
      // console.log(`User disconnected: ${socket.user.uid}`)
    })
  })
}
