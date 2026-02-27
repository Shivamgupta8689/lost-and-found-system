import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { getItems } from '../services/itemService.js'
import ItemCard from '../components/items/ItemCard.jsx'
import Loader from '../components/common/Loader.jsx'
import { CATEGORIES } from '../utils/validators.js'
import toast from 'react-hot-toast'

export default function BrowseItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const data = await getItems({ status: 'active' })
      setItems(data.items || [])
    } catch (err) {
      toast.error('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationFound.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Browse Found Items</h1>
        <p className="mt-1 text-surface-500">Search through items reported on campus</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, description, or location..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-11 pr-8 py-2.5 bg-white border border-surface-200 rounded-lg text-surface-900 focus:border-primary-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Loader fullScreen />
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700">No items found</h3>
          <p className="mt-1 text-surface-400">
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'No items have been posted yet. Check back later!'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-surface-500 mb-4">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
