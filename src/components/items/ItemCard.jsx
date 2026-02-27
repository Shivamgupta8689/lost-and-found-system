import { Link } from 'react-router-dom'
import { MapPin, Calendar, Tag } from 'lucide-react'
import { formatDate } from '../../utils/formatDate.js'

const categoryColors = {
  Electronics: 'bg-blue-50 text-blue-700',
  Clothing: 'bg-pink-50 text-pink-700',
  Documents: 'bg-amber-50 text-amber-700',
  Accessories: 'bg-emerald-50 text-emerald-700',
  Books: 'bg-indigo-50 text-indigo-700',
  Keys: 'bg-orange-50 text-orange-700',
  Bags: 'bg-teal-50 text-teal-700',
  Other: 'bg-surface-100 text-surface-600',
}

export default function ItemCard({ item }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="group bg-white rounded-xl border border-surface-200 overflow-hidden hover:border-primary-200 hover:shadow-md transition-all"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-surface-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300">
            <Tag className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {item.title}
          </h3>
          <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[item.category] || categoryColors.Other}`}>
            {item.category}
          </span>
        </div>
        <p className="text-sm text-surface-500 line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center gap-4 text-xs text-surface-400">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {item.locationFound}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(item.dateFound)}
          </span>
        </div>
      </div>
    </Link>
  )
}
