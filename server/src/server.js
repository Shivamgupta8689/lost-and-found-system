import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import app from './app.js'
import { initializeSocket } from './socket/socketHandler.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})

// Initialize Socket.io handlers
initializeSocket(io)

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Accepting connections from: ${CLIENT_URL}`)
})
