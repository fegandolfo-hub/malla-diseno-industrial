import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAIsfyCZraB4qpSCkbSR4GxgzAmTDz8b1Q",
  authDomain: "malla-diseno-industrial.firebaseapp.com",
  projectId: "malla-diseno-industrial",
  storageBucket: "malla-diseno-industrial.firebasestorage.app",
  messagingSenderId: "37133099670",
  appId: "1:37133099670:web:dcdddb15a0451ae458d8b7",
  measurementId: "G-V4FJDJN4SQ"
}

const app = initializeApp(firebaseConfig)
const db  = getFirestore(app)

// Sanitize email to use as Firestore document ID
const emailToId = (email) =>
  email.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')

export async function loadProgress(email) {
  try {
    const ref  = doc(db, 'progresos', emailToId(email))
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data().approved ?? []
    return []
  } catch (e) {
    console.error('loadProgress error:', e)
    return []
  }
}

export async function saveProgress(email, approvedSet) {
  try {
    const ref = doc(db, 'progresos', emailToId(email))
    await setDoc(ref, {
      email,
      approved: [...approvedSet],
      updatedAt: new Date().toISOString(),
    })
  } catch (e) {
    console.error('saveProgress error:', e)
  }
}
