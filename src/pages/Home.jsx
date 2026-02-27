import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Search, Upload, Shield, MessageSquare, ArrowRight } from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Upload,
      title: 'Report Found Items',
      description: 'Found something on campus? Upload a photo with details and set verification questions to protect the item.',
    },
    {
      icon: Search,
      title: 'Browse Lost Items',
      description: 'Lost something? Browse through reported found items and identify yours by answering verification questions.',
    },
    {
      icon: Shield,
      title: 'Secure Verification',
      description: 'Only the true owner can answer the verification questions correctly to get the finder\'s contact details.',
    },
    {
      icon: MessageSquare,
      title: 'Private Chat',
      description: 'Need to discuss further? Real-time private chat between finder and claimant ensures secure communication.',
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-soft" />
              Trusted by campus students
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-900 tracking-tight leading-tight text-balance">
              Lost Something on Campus?{' '}
              <span className="text-primary-500">We Help You Find It.</span>
            </h1>
            <p className="mt-6 text-lg text-surface-500 max-w-2xl mx-auto leading-relaxed text-pretty">
              A secure platform where campus community members can report found items and rightful
              owners can reclaim them through a verified process.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/browse"
                    className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25"
                  >
                    <Search className="w-5 h-5" />
                    Browse Lost Items
                  </Link>
                  <Link
                    to="/post-item"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-surface-700 font-semibold rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Report Found Item
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-surface-700 font-semibold rounded-xl border border-surface-200 hover:bg-surface-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Decorative bg element */}
        <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2" />
      </section>

      {/* How It Works */}
      <section className="bg-surface-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">How It Works</h2>
            <p className="mt-3 text-surface-500 max-w-xl mx-auto">
              A simple three-step process to reconnect lost items with their owners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Finder Reports', desc: 'Upload item photo, add details, and set verification questions.' },
              { step: '02', title: 'Owner Verifies', desc: 'Answer questions correctly to prove ownership and get contact info.' },
              { step: '03', title: 'Connect & Collect', desc: 'Contact the finder directly or chat in-app to arrange pickup.' },
            ].map((item) => (
              <div key={item.step} className="relative bg-white p-8 rounded-2xl border border-surface-200 hover:border-primary-200 transition-colors group">
                <span className="text-5xl font-extrabold text-primary-100 group-hover:text-primary-200 transition-colors">
                  {item.step}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-surface-900">{item.title}</h3>
                <p className="mt-2 text-surface-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-surface-900">Features</h2>
            <p className="mt-3 text-surface-500">Built with security and simplicity in mind.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="p-6 rounded-2xl bg-surface-50 hover:bg-primary-50 border border-transparent hover:border-primary-100 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-surface-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-surface-500 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            Campus Lost & Found. Built for students, by students. Secure and transparent.
          </p>
        </div>
      </footer>
    </div>
  )
}
