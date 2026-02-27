import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getUserItems, deleteItem, updateItemStatus } from '../services/itemService.js'
import Loader from '../components/common/Loader.jsx'
import { formatDate } from '../utils/formatDate.js'
import { Package, Plus, Trash2, CheckCircle, Eye, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => {
    fetchUserItems()
  }, [])

  const fetchUserItems = async () => {
    try {
      setLoading(true)
      const data = await getUserItems()
      setItems(data.items || [])
    } catch (err) {
      toast.error('Failed to load your items')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    try {
      await deleteItem(itemId)
      setItems(items.filter((i) => i.id !== itemId))
      toast.success('Item deleted')
    } catch (err) {
      toast.error('Failed to delete item')
    }
  }

  const handleMarkClaimed = async (itemId) => {
    try {
      await updateItemStatus(itemId, 'claimed')
      setItems(items.map((i) => (i.id === itemId ? { ...i, status: 'claimed' } : i)))
      toast.success('Item marked as claimed')
    } catch (err) {
      toast.error('Failed to update item')
    }
    setOpenMenu(null)
  }

  if (loading) return <Loader fullScreen />

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">My Dashboard</h1>
          <p className="mt-1 text-surface-500">Manage items you have posted</p>
        </div>
        <Link
          to="/post-item"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Post Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-200">
          <Package className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700">No items posted yet</h3>
          <p className="mt-1 text-surface-400 mb-6">
            Found something on campus? Post it to help someone find their belongings.
          </p>
          <Link
            to="/post-item"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Post Your First Item
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Item</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-surface-300" />
                          </div>
                        )}
                        <span className="font-medium text-surface-900 text-sm">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-surface-600">{item.locationFound}</td>
                    <td className="px-6 py-4 text-sm text-surface-500">{formatDate(item.dateFound)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          item.status === 'claimed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {item.status === 'claimed' ? 'Claimed' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/items/${item.id}`}
                          className="p-2 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {item.status !== 'claimed' && (
                          <button
                            onClick={() => handleMarkClaimed(item.id)}
                            className="p-2 text-surface-400 hover:text-success rounded-lg hover:bg-green-50 transition-colors"
                            title="Mark as Claimed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-surface-400 hover:text-danger rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-surface-100">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-surface-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-surface-900 text-sm truncate">{item.title}</h3>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                          className="p-1 text-surface-400 hover:text-surface-600 rounded"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === item.id && (
                          <div className="absolute right-0 top-6 bg-white border border-surface-200 rounded-lg shadow-lg py-1 z-10 w-40 animate-fade-in">
                            <Link
                              to={`/items/${item.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 hover:bg-surface-50"
                              onClick={() => setOpenMenu(null)}
                            >
                              <Eye className="w-4 h-4" /> View
                            </Link>
                            {item.status !== 'claimed' && (
                              <button
                                onClick={() => handleMarkClaimed(item.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-surface-700 hover:bg-surface-50"
                              >
                                <CheckCircle className="w-4 h-4" /> Mark Claimed
                              </button>
                            )}
                            <button
                              onClick={() => { handleDelete(item.id); setOpenMenu(null) }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{item.locationFound}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          item.status === 'claimed'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {item.status === 'claimed' ? 'Claimed' : 'Active'}
                      </span>
                      <span className="text-xs text-surface-400">{item.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
