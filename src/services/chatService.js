import api from './api.js'

export const getUserChats = async () => {
  const response = await api.get('/chats')
  return response.data
}

export const getChatById = async (chatId) => {
  const response = await api.get(`/chats/${chatId}`)
  return response.data
}

export const getChatMessages = async (chatId) => {
  const response = await api.get(`/chats/${chatId}/messages`)
  return response.data
}
