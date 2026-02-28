import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext.jsx'
import { auth } from '../config/firebase.js'

const SocketContext = createContext(null)

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

const connectSocket = async () => {
  try {
    const token = await auth.currentUser?.getIdToken()
    if (!token) return

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    })

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    setSocket(newSocket)

    return newSocket // cleanup ke liye return karo
  } catch (err) {
    console.error('Failed to connect socket:', err)
  }
}

// Cleanup fix
useEffect(() => {
  if (!user) {
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
    return
  }

  let newSocket
  const connect = async () => {
    newSocket = await connectSocket()
  }
  connect()

  return () => {
    if (newSocket) newSocket.disconnect() // ✅ correct reference
  }
}, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
