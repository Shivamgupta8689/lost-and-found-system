export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
  }

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Dual-ring spinner */}
      <div className={`relative ${sizeClasses[size]}`} role="status" aria-label="Loading">
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full border-2 border-primary-100`} />
        {/* Spinning arc */}
        <div className={`absolute inset-0 rounded-full border-2 border-transparent border-t-primary-500 animate-spin`} />
        {/* Inner dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${dotSizes[size]} rounded-full bg-primary-400 animate-pulse`} />
        </div>
        <span className="sr-only">Loading...</span>
      </div>

      {/* Optional text */}
      {text && (
        <p className="text-sm text-surface-400 font-medium animate-pulse">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        {spinner}
      </div>
    )
  }

  return spinner
}