import { db } from '../config/firebase.js'
import admin from 'firebase-admin'

// POST /api/auth/register - Save user profile to Firestore
export const registerUser = async (req, res) => {
  try {
    const { name, email } = req.body
    const uid = req.user.uid

    await db.collection('users').doc(uid).set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true })

    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({ message: 'Failed to register user' })
  }
}

// GET /api/auth/me - Get current user profile
export const getMe = async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get()
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user: { id: userDoc.id, ...userDoc.data() } })
  } catch (error) {
    console.error('Get me error:', error.message)
    res.status(500).json({ message: 'Failed to get user profile' })
  }
}
