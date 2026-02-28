import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import itemRoutes from './routes/itemRoutes.js'
import chatRoutes from './routes/chatRoutes.js'

dotenv.config()

const app = express()

//  Same allowedOrigins logic
const allowedOrigins = [
  process.env.CLIENT_URL,
  /https:\/\/lost-and-found-system-.*\.vercel\.app$/,
  'http://localhost:5173',
]

// Middleware
app.use(cors({
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/chats', chatRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size must be under 5MB' })
    }
    return res.status(400).json({ message: err.message })
  }
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

export default app
