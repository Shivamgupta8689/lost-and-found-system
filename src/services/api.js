import axios from 'axios'
import { auth } from '../config/firebase.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Firebase ID token to every request
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser
    if (user) {
      const token = await user.getIdToken()
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Full error:', error.response) // ✅ ye add karo
    const message = error.response?.data?.message || 'Something went wrong'
    return Promise.reject({ message, status: error.response?.status })
  }
)

export default api
