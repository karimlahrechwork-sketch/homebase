import { useState, useEffect } from 'react'
import {
  doc, collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  setDoc, getDoc, query, where, serverTimestamp, arrayUnion, arrayRemove
} from 'firebase/firestore'
import { db } from '../firebase'

export function useHousehold(user) {
  const [household, setHousehold] = useState(null)
  const [tasks, setTasks] = useState([])
  const [logs, setLogs] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Load or create household for user
  useEffect(() => {
    if (!user) { setLoading(false); return }
    const userDocRef = doc(db, 'users', user.uid)
    const unsub = onSnapshot(userDocRef, async (snap) => {
      if (!snap.exists()) {
        // New user — create household
        const hRef = await addDoc(collection(db, 'households'), {
          name: 'My Home',
          createdBy: user.uid,
          members: [user.uid],
          memberEmails: [user.email],
          createdAt: serverTimestamp(),
        })
        await setDoc(userDocRef, { householdId: hRef.id, email: user.email, displayName: user.displayName || user.email.split('@')[0] })
        setHousehold({ id: hRef.id, name: 'My Home' })
      } else {
        const hId = snap.data().householdId
        const hSnap = await getDoc(doc(db, 'households', hId))
        if (hSnap.exists()) setHousehold({ id: hId, ...hSnap.data() })
      }
      setLoading(false)
    })
    return unsub
  }, [user])

  // Subscribe to tasks
  useEffect(() => {
    if (!household?.id) return
    const q = query(collection(db, 'tasks'), where('householdId', '==', household.id))
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [household?.id])

  // Subscribe to logs
  useEffect(() => {
    if (!household?.id) return
    const q = query(collection(db, 'logs'), where('householdId', '==', household.id))
    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [household?.id])

  // Subscribe to member profiles
  useEffect(() => {
    if (!household?.members?.length) return
    const unsubs = household.members.map(uid => {
      return onSnapshot(doc(db, 'users', uid), (snap) => {
        if (snap.exists()) {
          setMembers(prev => {
            const filtered = prev.filter(m => m.uid !== uid)
            return [...filtered, { uid, ...snap.data() }]
          })
        }
      })
    })
    return () => unsubs.forEach(u => u())
  }, [household?.members])

  async function addTask(data) {
    await addDoc(collection(db, 'tasks'), {
      ...data,
      householdId: household.id,
      createdBy: user.uid,
      done: false,
      createdAt: serverTimestamp(),
    })
  }

  async function toggleTask(id, done) {
    await updateDoc(doc(db, 'tasks', id), { done: !done })
  }

  async function deleteTask(id) {
    await deleteDoc(doc(db, 'tasks', id))
  }

  async function addLog(data, taskId) {
    await addDoc(collection(db, 'logs'), {
      ...data,
      householdId: household.id,
      loggedBy: user.uid,
      loggedAt: serverTimestamp(),
    })
    await updateDoc(doc(db, 'tasks', taskId), { done: true })
  }

  async function inviteMember(email) {
    // Find user by email
    const q = query(collection(db, 'users'), where('email', '==', email))
    const { getDocs } = await import('firebase/firestore')
    const snap = await getDocs(q)
    if (snap.empty) return { error: 'No account found with that email.' }
    const invitedUser = snap.docs[0]
    const invitedUid = invitedUser.id
    if (household.members.includes(invitedUid)) return { error: 'Already a member.' }
    // Add to household
    await updateDoc(doc(db, 'households', household.id), {
      members: arrayUnion(invitedUid),
      memberEmails: arrayUnion(email),
    })
    // Update invited user's householdId
    await updateDoc(doc(db, 'users', invitedUid), { householdId: household.id })
    return { success: true }
  }

  async function removeMember(uid) {
    if (uid === user.uid) return
    await updateDoc(doc(db, 'households', household.id), {
      members: arrayRemove(uid),
    })
  }

  async function updateHouseholdName(name) {
    await updateDoc(doc(db, 'households', household.id), { name })
    setHousehold(h => ({ ...h, name }))
  }

  return {
    household, tasks, logs, members, loading,
    addTask, toggleTask, deleteTask, addLog,
    inviteMember, removeMember, updateHouseholdName,
  }
}
