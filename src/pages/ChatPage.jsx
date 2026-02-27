import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import { getChatById, getChatMessages } from '../services/chatService.js'
import Loader from '../components/common/Loader.jsx'
import { formatTime, formatDate } from '../utils/formatDate.js'
import { ArrowLeft, Send, Package, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const socket = useSocket()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUser, setTypingUser] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch chat and messages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [chatData, messagesData] = await Promise.all([
          getChatById(chatId),
          getChatMessages(chatId),
        ])
        setChat(chatData.chat)
        setMessages(messagesData.messages || [])
      } catch (err) {
        toast.error('Failed to load chat')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [chatId])

  // Socket events
  useEffect(() => {
    if (!socket || !chatId) return

    socket.emit('join-chat', { chatId })

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('user-typing', ({ name }) => {
      setTypingUser(name)
    })

    socket.on('user-stop-typing', () => {
      setTypingUser(null)
    })

    socket.on('error', ({ message }) => {
      toast.error(message)
    })

    return () => {
      socket.emit('leave-chat', { chatId })
      socket.off('new-message')
      socket.off('user-typing')
      socket.off('user-stop-typing')
      socket.off('error')
    }
  }, [socket, chatId])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, typingUser])

  const handleSend = (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !socket) return

    setSending(true)
    socket.emit('send-message', {
      chatId,
      text: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)

    // Stop typing indicator
    socket.emit('stop-typing', { chatId })
  }

  const handleTyping = (e) => {
    setNewMessage(e.target.value)
    if (!socket) return

    socket.emit('typing', { chatId })
    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { chatId })
    }, 1500)
  }

  if (loading) return <Loader fullScreen />
  if (!chat) return null

  const otherName =
    user?.uid === chat.finderUid ? chat.loserName : chat.finderName

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg) => {
    const date = formatDate(msg.createdAt)
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Chat Header */}
      <div className="bg-white border-b border-surface-200 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
        <Link
          to="/chats"
          className="p-2 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-surface-900 text-sm truncate">{otherName}</h2>
          <div className="flex items-center gap-1 text-xs text-surface-400">
            <Package className="w-3 h-3" />
            <span className="truncate">{chat.itemTitle}</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 chat-messages bg-surface-50">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-surface-200" />
              <span className="text-xs text-surface-400 font-medium">{date}</span>
              <div className="flex-1 h-px bg-surface-200" />
            </div>

            {/* Messages */}
            {msgs.map((msg, index) => {
              const isOwn = msg.senderUid === user?.uid
              return (
                <div
                  key={msg.id || index}
                  className={`flex mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl ${
                      isOwn
                        ? 'bg-primary-500 text-white rounded-br-md'
                        : 'bg-white text-surface-900 border border-surface-200 rounded-bl-md'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold text-primary-600 mb-0.5">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/60' : 'text-surface-400'
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {typingUser && (
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white border border-surface-200 px-4 py-2.5 rounded-2xl rounded-bl-md">
              <div className="flex items-center gap-1">
                <span className="text-xs text-surface-500">{typingUser} is typing...</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-surface-200 px-4 sm:px-6 py-3 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
