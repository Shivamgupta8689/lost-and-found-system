import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import app from './app.js'
import { initializeSocket } from './socket/socketHandler.js'

dotenv.config()

const PORT = process.env.PORT || 5000

// First .env se lo, Rest vercel previews from regex
const allowedOrigins = [
  process.env.CLIENT_URL,
  /https:\/\/lost-and-found-system-.*\.vercel\.app$/,
  'http://localhost:5173',
]

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const isAllowed = allowedOrigins.some(allowed =>
        allowed instanceof RegExp
          ? allowed.test(origin)
          : allowed === origin
      )
      isAllowed
        ? callback(null, true)
        : callback(new Error(`CORS blocked: ${origin}`))
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
})

initializeSocket(io)

app.get('/health', (req, res) => res.status(200).send('OK'))

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Primary origin: ${process.env.CLIENT_URL}`)
})
