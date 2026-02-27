import api from './api.js'

export const getItems = async (params = {}) => {
  const response = await api.get('/items', { params })
  return response.data
}

export const getItemById = async (id) => {
  const response = await api.get(`/items/${id}`)
  return response.data
}

export const createItem = async (formData) => {
  const response = await api.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export const updateItemStatus = async (id, status) => {
  const response = await api.patch(`/items/${id}/status`, { status })
  return response.data
}

export const deleteItem = async (id) => {
  const response = await api.delete(`/items/${id}`)
  return response.data
}

export const getUserItems = async () => {
  const response = await api.get('/items/user/me')
  return response.data
}
