import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getItemById } from '../services/itemService.js'
import { verifyAnswers } from '../services/claimService.js'
import Loader from '../components/common/Loader.jsx'
import { formatDate } from '../utils/formatDate.js'
import {
  MapPin, Calendar, Tag, ArrowLeft, Shield, CheckCircle,
  XCircle, Phone, User, MessageSquare, Send
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ItemDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState([])
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null) // { verified, finderName, finderContact, chatId }

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    try {
      setLoading(true)
      const data = await getItemById(id)
      setItem(data.item)
      setAnswers(new Array(data.item.questions?.length || 0).fill(''))
    } catch (err) {
      toast.error('Failed to load item')
      navigate('/browse')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()

    if (answers.some((a) => !a.trim())) {
      toast.error('Please answer all questions')
      return
    }

    setVerifying(true)
    try {
      const result = await verifyAnswers(id, answers)
      setVerificationResult(result)

      if (result.verified) {
        toast.success('Verification successful! Contact details revealed.')
      } else {
        toast.error('Incorrect answers. A chat has been created with the finder.')
      }
    } catch (err) {
      toast.error(err?.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) return <Loader fullScreen />
  if (!item) return null

  const isOwnItem = user?.uid === item.finderUid

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link
        to="/browse"
        className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Image + Info */}
        <div className="lg:col-span-3">
          {/* Image */}
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden mb-6">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-64 sm:h-80 object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-64 bg-surface-100 flex items-center justify-center">
                <Tag className="w-16 h-16 text-surface-300" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-surface-900">{item.title}</h1>
              <span className="shrink-0 px-3 py-1 text-sm font-medium bg-primary-50 text-primary-700 rounded-full">
                {item.category}
              </span>
            </div>

            <p className="text-surface-600 leading-relaxed mb-6">{item.description}</p>

            <div className="flex flex-wrap gap-6 text-sm text-surface-500">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-surface-400" />
                {item.locationFound}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-surface-400" />
                {formatDate(item.dateFound)}
              </span>
            </div>

            {item.status === 'claimed' && (
              <div className="mt-4 px-4 py-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                This item has been claimed
              </div>
            )}
          </div>
        </div>

        {/* Verification Panel */}
        <div className="lg:col-span-2">
          {isOwnItem ? (
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-2">Your Posted Item</h2>
              <p className="text-sm text-surface-500">
                This is an item you posted. You can manage it from your dashboard.
              </p>
              <Link
                to="/dashboard"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                Go to Dashboard
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          ) : verificationResult?.verified ? (
            /* Success - Show contact */
            <div className="bg-white rounded-2xl border border-green-200 p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-green-800">Verified!</h2>
                  <p className="text-sm text-green-600">Contact the finder to collect your item</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Finder Name</p>
                    <p className="text-sm font-semibold text-green-900">{verificationResult.finderName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Contact Number</p>
                    <p className="text-sm font-semibold text-green-900">{verificationResult.finderContact}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : verificationResult && !verificationResult.verified ? (
            /* Failed - Chat created */
            <div className="bg-white rounded-2xl border border-amber-200 p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-amber-800">Incorrect Answers</h2>
                  <p className="text-sm text-amber-600">A private chat has been created</p>
                </div>
              </div>
              <p className="text-sm text-surface-600 mb-4">
                Your answers did not match. You can discuss with the finder through a private chat to resolve this.
              </p>
              <button
                onClick={() => navigate(`/chats/${verificationResult.chatId}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Open Chat
              </button>
            </div>
          ) : (
            /* Verification Form */
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900">Claim This Item</h2>
                  <p className="text-sm text-surface-500">Answer to verify ownership</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="flex flex-col gap-4">
                {item.questions?.map((q, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      {q.question}
                    </label>
                    <input
                      type="text"
                      value={answers[index] || ''}
                      onChange={(e) => {
                        const newAnswers = [...answers]
                        newAnswers[index] = e.target.value
                        setAnswers(newAnswers)
                      }}
                      placeholder="Your answer"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                >
                  {verifying ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Verify & Claim
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
