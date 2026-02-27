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
          transports: ['websocket', 'polling'],
        })

        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id)
        })

        newSocket.on('connect_error', (err) => {
          console.error('Socket connection error:', err.message)
        })

        setSocket(newSocket)
      } catch (err) {
        console.error('Failed to connect socket:', err)
      }
    }

    connectSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
