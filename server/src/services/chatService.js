import { db } from '../config/firebase.js'
import admin from 'firebase-admin'

export const createChat = async ({ itemId, itemTitle, finderUid, finderName, loserUid, loserName }) => {
  // Check if a chat already exists for this item between these users
  const existingChat = await db.collection('chats')
    .where('itemId', '==', itemId)
    .where('finderUid', '==', finderUid)
    .where('loserUid', '==', loserUid)
    .get()

  if (!existingChat.empty) {
    const doc = existingChat.docs[0]
    return { id: doc.id, ...doc.data() }
  }

  // Create new chat
  const chatRef = await db.collection('chats').add({
    itemId,
    itemTitle,
    finderUid,
    finderName,
    loserUid,
    loserName,
    lastMessage: '',
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  const chatDoc = await chatRef.get()
  return { id: chatDoc.id, ...chatDoc.data() }
}

export const addMessage = async (chatId, { senderUid, senderName, text }) => {
  const msgRef = await db.collection('chats').doc(chatId).collection('messages').add({
    senderUid,
    senderName,
    text,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  // Update last message on chat doc
  await db.collection('chats').doc(chatId).update({
    lastMessage: text.length > 50 ? text.substring(0, 50) + '...' : text,
    lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  const msgDoc = await msgRef.get()
  return {
    id: msgDoc.id,
    ...msgDoc.data(),
    createdAt: msgDoc.data().createdAt?.toDate?.() || new Date(),
  }
}

export const getChatParticipants = async (chatId) => {
  const chatDoc = await db.collection('chats').doc(chatId).get()
  if (!chatDoc.exists) return null
  const data = chatDoc.data()
  return {
    finderUid: data.finderUid,
    loserUid: data.loserUid,
  }
}

// Delete all chats (and their messages subcollections) for a given item
export const deleteChatsForItem = async (itemId) => {
  const chatsSnapshot = await db.collection('chats')
    .where('itemId', '==', itemId)
    .get()

  if (chatsSnapshot.empty) return 0

  const batch = db.batch()
  let deletedCount = 0

  for (const chatDoc of chatsSnapshot.docs) {
    // Delete all messages in the subcollection first
    const messagesSnapshot = await chatDoc.ref.collection('messages').get()
    messagesSnapshot.docs.forEach((msgDoc) => {
      batch.delete(msgDoc.ref)
    })

    // Delete the chat document itself
    batch.delete(chatDoc.ref)
    deletedCount++
  }

  await batch.commit()
  return deletedCount
}
