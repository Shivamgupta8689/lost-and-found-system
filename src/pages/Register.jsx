import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Mail, Lock, Eye, EyeOff, User, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { validateEmail, validatePassword } from '../utils/validators.js'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!validateEmail(email)) {
      toast.error('Please enter a valid email')
      return
    }
    if (!validatePassword(password)) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register(name.trim(), email, password)
      toast.success('Account created successfully!')
      navigate('/browse')
    } catch (err) {
      const code = err?.code
      const msg = code === 'auth/email-already-in-use'
        ? 'This email is already registered'
        : code === 'auth/weak-password'
        ? 'Password is too weak'
        : err?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-900">Create Account</h1>
          <p className="mt-2 text-surface-500">Join the campus lost and found community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-surface-200 shadow-sm">
          {/* Name */}
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-medium text-surface-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full pl-11 pr-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-11 pr-11 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-11 pr-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
