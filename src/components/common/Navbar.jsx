import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Search, Menu, X, LogOut, MessageSquare, LayoutDashboard, PlusCircle, Package } from 'lucide-react'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { path: '/browse', label: 'Browse', icon: Search },
    { path: '/post-item', label: 'Post Item', icon: PlusCircle },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/chats', label: 'Chats', icon: MessageSquare },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-surface-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 group-hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors shadow-sm shadow-primary-500/30">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-base text-surface-900 tracking-tight">
              Campus<span className="text-primary-500">L&F</span>
            </span>
          </Link>

          {/* Desktop Nav — clean underline style */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.path)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-1.5 py-5 text-sm font-medium transition-colors ${
                      active
                        ? 'text-primary-600'
                        : 'text-surface-500 hover:text-surface-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {link.label}
                    {/* Active underline */}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Avatar */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-600">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-surface-800">
                    {user?.name?.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-surface-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors shadow-sm shadow-primary-500/20"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-surface-500 hover:text-surface-900 rounded-lg hover:bg-surface-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden pb-4 pt-2 border-t border-surface-100 space-y-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}

            <div className="h-px bg-surface-100 my-2" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-surface-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}