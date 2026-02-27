import { authAdmin, db } from '../config/firebase.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authentication token provided' })
    }

    const token = authHeader.split('Bearer ')[1]
    const decodedToken = await authAdmin.verifyIdToken(token)

    // Fetch user profile from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get()
    const userData = userDoc.exists ? userDoc.data() : {}

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: userData.name || decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}
