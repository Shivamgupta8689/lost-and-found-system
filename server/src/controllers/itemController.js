import { db } from '../config/firebase.js'
import admin from 'firebase-admin'
import { uploadImage, deleteImage } from '../services/cloudinaryService.js'
import { deleteChatsForItem } from '../services/chatService.js'

// POST /api/items - Create a new item
export const createItem = async (req, res) => {
  try {
    const { title, description, category, locationFound, dateFound, finderName, finderContact, questions } = req.body
    const parsedQuestions = JSON.parse(questions)

    if (!title || !description || !category || !locationFound || !dateFound) {
      return res.status(400).json({ message: 'All item details are required' })
    }
    if (!finderName || !finderContact) {
      return res.status(400).json({ message: 'Finder contact details are required' })
    }
    if (!parsedQuestions || parsedQuestions.length === 0) {
      return res.status(400).json({ message: 'At least one verification question is required' })
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Item image is required' })
    }

    // Upload image to Cloudinary
    const imageResult = await uploadImage(req.file.buffer)

    const itemRef = await db.collection('items').add({
      title,
      description,
      category,
      locationFound,
      dateFound,
      imageUrl: imageResult.secure_url,
      imagePublicId: imageResult.public_id,
      finderUid: req.user.uid,
      finderName,
      finderContact,
      questions: parsedQuestions,
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    res.status(201).json({
      message: 'Item posted successfully',
      item: { id: itemRef.id },
    })
  } catch (error) {
    console.error('Create item error:', error.message)
    res.status(500).json({ message: 'Failed to post item' })
  }
}

// GET /api/items - Get all items (no answers/contact exposed)
export const getItems = async (req, res) => {
  try {
    const { status, category } = req.query
    let query = db.collection('items').orderBy('createdAt', 'desc')

    if (status) {
      query = query.where('status', '==', status)
    }

    const snapshot = await query.get()
    const items = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        locationFound: data.locationFound,
        dateFound: data.dateFound,
        imageUrl: data.imageUrl,
        finderUid: data.finderUid,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || null,
      }
    })

    // Filter by category client-side if needed (Firestore doesn't allow combining orderBy with where on different fields easily)
    const filtered = category ? items.filter((i) => i.category === category) : items

    res.json({ items: filtered })
  } catch (error) {
    console.error('Get items error:', error.message)
    res.status(500).json({ message: 'Failed to fetch items' })
  }
}

// GET /api/items/user/me - Get items posted by current user
export const getUserItems = async (req, res) => {
  try {
    const snapshot = await db.collection('items')
      .where('finderUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get()

    const items = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category,
        locationFound: data.locationFound,
        dateFound: data.dateFound,
        imageUrl: data.imageUrl,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || null,
      }
    })

    res.json({ items })
  } catch (error) {
    console.error('Get user items error:', error.message)
    res.status(500).json({ message: 'Failed to fetch your items' })
  }
}

// GET /api/items/:id - Get single item (questions without answers)
export const getItemById = async (req, res) => {
  try {
    const doc = await db.collection('items').doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ message: 'Item not found' })
    }

    const data = doc.data()
    const item = {
      id: doc.id,
      title: data.title,
      description: data.description,
      category: data.category,
      locationFound: data.locationFound,
      dateFound: data.dateFound,
      imageUrl: data.imageUrl,
      finderUid: data.finderUid,
      status: data.status,
      createdAt: data.createdAt?.toDate?.() || null,
      // Only send questions text, NOT answers
      questions: data.questions.map((q) => ({ question: q.question })),
    }

    res.json({ item })
  } catch (error) {
    console.error('Get item error:', error.message)
    res.status(500).json({ message: 'Failed to fetch item' })
  }
}

// PATCH /api/items/:id/status - Update item status
export const updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body
    const doc = await db.collection('items').doc(req.params.id).get()

    if (!doc.exists) {
      return res.status(404).json({ message: 'Item not found' })
    }
    if (doc.data().finderUid !== req.user.uid) {
      return res.status(403).json({ message: 'You can only update your own items' })
    }

    await db.collection('items').doc(req.params.id).update({ status })

    // If item is being marked as claimed, delete all related chats
    if (status === 'claimed') {
      const deletedCount = await deleteChatsForItem(req.params.id)
      console.log(`Item ${req.params.id} marked claimed via dashboard. Deleted ${deletedCount} related chat(s).`)
    }

    res.json({ message: 'Item status updated' })
  } catch (error) {
    console.error('Update status error:', error.message)
    res.status(500).json({ message: 'Failed to update item status' })
  }
}

// DELETE /api/items/:id - Delete an item
export const deleteItemController = async (req, res) => {
  try {
    const doc = await db.collection('items').doc(req.params.id).get()

    if (!doc.exists) {
      return res.status(404).json({ message: 'Item not found' })
    }
    if (doc.data().finderUid !== req.user.uid) {
      return res.status(403).json({ message: 'You can only delete your own items' })
    }

    // Delete image from Cloudinary
    if (doc.data().imagePublicId) {
      await deleteImage(doc.data().imagePublicId)
    }

    // Delete all chats related to this item
    const deletedCount = await deleteChatsForItem(req.params.id)
    console.log(`Item ${req.params.id} deleted. Cleaned up ${deletedCount} related chat(s).`)

    await db.collection('items').doc(req.params.id).delete()
    res.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Delete item error:', error.message)
    res.status(500).json({ message: 'Failed to delete item' })
  }
}
