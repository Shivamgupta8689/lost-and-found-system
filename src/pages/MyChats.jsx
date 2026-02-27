import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getUserChats } from '../services/chatService.js'
import Loader from '../components/common/Loader.jsx'
import { formatRelativeTime } from '../utils/formatDate.js'
import { MessageSquare, Package, ArrowRight, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MyChats() {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      setLoading(true)
      const data = await getUserChats()
      setChats(data.chats || [])
    } catch (err) {
      toast.error('Failed to load chats')
    } finally {
      setLoading(false)
    }
  }

  // Group chats by item
  const groupedChats = chats.reduce((acc, chat) => {
    const key = chat.itemId
    if (!acc[key]) {
      acc[key] = {
        itemId: chat.itemId,
        itemTitle: chat.itemTitle,
        chats: [],
      }
    }
    acc[key].chats.push(chat)
    return acc
  }, {})

  const groupedArray = Object.values(groupedChats)

  if (loading) return <Loader fullScreen />

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">My Chats</h1>
        <p className="mt-1 text-surface-500">Private conversations about lost items</p>
      </div>

      {groupedArray.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
          <MessageSquare className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700">No chats yet</h3>
          <p className="mt-1 text-surface-400 max-w-sm mx-auto">
            Chats are created when someone attempts to claim an item. Browse items to get started.
          </p>
          <Link
            to="/browse"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            Browse Items
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {groupedArray.map((group) => (
            <div key={group.itemId} className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
              {/* Item header */}
              <div className="px-5 py-3 bg-surface-50 border-b border-surface-100 flex items-center gap-2">
                <Package className="w-4 h-4 text-surface-400" />
                <span className="text-sm font-medium text-surface-700">{group.itemTitle}</span>
                <span className="text-xs text-surface-400 ml-auto">
                  {group.chats.length} chat{group.chats.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Chat entries */}
              <div className="divide-y divide-surface-100">
                {group.chats.map((chat) => {
                  const otherName =
                    user?.uid === chat.finderUid ? chat.loserName : chat.finderName
                  const role =
                    user?.uid === chat.finderUid ? 'Claimant' : 'Finder'

                  return (
                    <Link
                      key={chat.id}
                      to={`/chats/${chat.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50/70 transition-colors group"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-surface-900 text-sm truncate">
                            {otherName}
                          </span>
                          <span className="text-xs text-surface-400 px-1.5 py-0.5 bg-surface-100 rounded">
                            {role}
                          </span>
                        </div>
                        {chat.lastMessage && (
                          <p className="text-sm text-surface-500 truncate mt-0.5">
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>

                      {/* Time + Arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        {chat.lastMessageAt && (
                          <span className="text-xs text-surface-400">
                            {formatRelativeTime(chat.lastMessageAt)}
                          </span>
                        )}
                        <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-primary-500 transition-colors" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
