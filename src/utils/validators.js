export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0
}

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/
  return re.test(phone)
}

export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Documents',
  'Accessories',
  'Books',
  'Keys',
  'Bags',
  'Other',
]
