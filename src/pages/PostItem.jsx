import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { createItem } from '../services/itemService.js'
import { CATEGORIES } from '../utils/validators.js'
import { Upload, Plus, Trash2, Image as ImageIcon, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PostItem() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    locationFound: '',
    dateFound: '',
    finderName: user?.name || '',
    finderContact: '',
  })

  const [questions, setQuestions] = useState([
    { question: '', answer: '' },
  ])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be under 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const addQuestion = () => {
    if (questions.length >= 3) {
      toast.error('Maximum 3 questions allowed')
      return
    }
    setQuestions([...questions, { question: '', answer: '' }])
  }

  const removeQuestion = (index) => {
    if (questions.length <= 1) {
      toast.error('At least 1 question is required')
      return
    }
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index][field] = value
    setQuestions(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate
    if (!form.title || !form.description || !form.category || !form.locationFound || !form.dateFound) {
      toast.error('Please fill all item details')
      return
    }
    if (!form.finderName || !form.finderContact) {
      toast.error('Please fill your contact details')
      return
    }
    if (!imageFile) {
      toast.error('Please upload an image of the item')
      return
    }

    const emptyQ = questions.some((q) => !q.question.trim() || !q.answer.trim())
    if (emptyQ) {
      toast.error('Please fill all verification questions and answers')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('category', form.category)
      formData.append('locationFound', form.locationFound)
      formData.append('dateFound', form.dateFound)
      formData.append('finderName', form.finderName)
      formData.append('finderContact', form.finderContact)
      formData.append('questions', JSON.stringify(questions))
      formData.append('image', imageFile)

      await createItem(formData)
      toast.success('Item posted successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.message || 'Failed to post item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Report a Found Item</h1>
        <p className="mt-1 text-surface-500">
          Help someone find their lost belongings by providing detailed information
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
        {/* Item Details Section */}
        <div className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-surface-900 mb-5">Item Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-surface-700 mb-1.5">
                Item Name
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Black Samsung Phone"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-surface-700 mb-1.5">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 focus:border-primary-500 transition-colors"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dateFound" className="block text-sm font-medium text-surface-700 mb-1.5">
                Date Found
              </label>
              <input
                id="dateFound"
                name="dateFound"
                type="date"
                value={form.dateFound}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 focus:border-primary-500 transition-colors"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="locationFound" className="block text-sm font-medium text-surface-700 mb-1.5">
                Location Found
              </label>
              <input
                id="locationFound"
                name="locationFound"
                type="text"
                value={form.locationFound}
                onChange={handleChange}
                placeholder="e.g., Library 2nd Floor, Room 201"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-surface-700 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the item in detail (color, brand, condition, etc.)"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors resize-none"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Item Photo
            </label>
            {imagePreview ? (
              <div className="relative w-full max-w-sm">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-surface-200"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-danger hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-surface-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-colors">
                <ImageIcon className="w-8 h-8 text-surface-300 mb-2" />
                <span className="text-sm text-surface-500">Click to upload an image</span>
                <span className="text-xs text-surface-400 mt-1">Max 5MB, JPG/PNG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Finder Contact Section */}
        <div className="p-6 sm:p-8 border-t border-surface-100 bg-surface-50/50">
          <h2 className="text-lg font-semibold text-surface-900 mb-5">Your Contact Details</h2>
          <p className="text-sm text-surface-500 mb-4">
            These will only be revealed when someone correctly answers the verification questions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="finderName" className="block text-sm font-medium text-surface-700 mb-1.5">
                Your Name
              </label>
              <input
                id="finderName"
                name="finderName"
                type="text"
                value={form.finderName}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors bg-white"
                required
              />
            </div>
            <div>
              <label htmlFor="finderContact" className="block text-sm font-medium text-surface-700 mb-1.5">
                Contact Number
              </label>
              <input
                id="finderContact"
                name="finderContact"
                type="tel"
                value={form.finderContact}
                onChange={handleChange}
                placeholder="e.g., 9876543210"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Verification Questions Section */}
        <div className="p-6 sm:p-8 border-t border-surface-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-surface-900">Verification Questions</h2>
              <p className="text-sm text-surface-500 mt-0.5">
                Set questions only the real owner would know ({questions.length}/3)
              </p>
            </div>
            {questions.length < 3 && (
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {questions.map((q, index) => (
              <div key={index} className="p-4 bg-surface-50 rounded-lg border border-surface-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-surface-600">
                    Question {index + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-surface-400 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                  placeholder="e.g., What color is the phone case?"
                  className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors mb-3 bg-white"
                  required
                />
                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) => updateQuestion(index, 'answer', e.target.value)}
                  placeholder="Correct answer"
                  className="w-full px-4 py-2.5 border border-surface-200 rounded-lg text-surface-900 placeholder:text-surface-400 focus:border-primary-500 transition-colors bg-white"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 sm:p-8 border-t border-surface-100 bg-surface-50/50">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Post Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
