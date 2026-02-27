import api from './api.js'

export const verifyAnswers = async (itemId, answers) => {
  const response = await api.post(`/items/${itemId}/verify`, { answers })
  return response.data
}
