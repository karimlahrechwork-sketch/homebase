import { signOut } from 'firebase/auth'
import { auth, requestNotificationPermission } from '../firebase'
import { useState } from 'react'
import { AlertTriangle, Clock, LogOut, Bell, Users, Edit2, Check } from 'lucide-react'

const ROOMS = [
  { id: 'kitchen', label: 'Kitchen' }, { id: 'bathroom', label: 'Bathroom' },
  { id: 'electrical', label: 'Electrical' }, { id: 'hvac', label: 'HVAC' },
  { id: 'exterior', label: 'Exterior' }, { id: 'garage', label: 'Garage' },
  { id: 'roof', label: 'Roof' }, { id: 'other', label: 'Other' },
]

function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 864e5) }

export default function HomeScreen({ user, household, tasks, logs, members, inviteMember, removeMember, updateHouseholdName }) {
  const [showMembers, setShowMembers] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')
  const [notifStatus, setNotifStatus] = useState('')
  const [editingName, setEditingName] = useState(false)
  const [homeName, setHomeName] = useState(household?.name || 'My Home')

  const active = tasks.filter(t => !t.done)
  const overdue = active.filter(t => daysUntil(t.dueDate) < 0)
  const dueSoon = active.filter(t => { const d = daysUntil(t.dueDate); return d !== null && d >= 0 && d <= 7 })
  const totalSpent = logs.reduce((s, l) => s + (parseFloat(l.cost) || 0), 0)

  async function handleEnableNotifications() {
    setNotifStatus('Requesting...')
    const token = await requestNotificationPermission(household?.id)
    if (token) {
      // Save FCM token to Firestore for this user
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('../firebase')
      await updateDoc(doc(db, 'users', user.uid), { fcmToken: token })
      setNotifStatus('Notifications enabled!')
    } else {
      setNotifStatus('Permission denied or not supported.')
    }
    setTimeout(() => setNotifStatus(''), 3000)
  }

  async function handleInvite() {
    setInviteMsg('')
    const result = await inviteMember(inviteEmail.trim().toLowerCase())
    if (result.error) setInviteMsg(result.error)
    else { setInviteMsg('Member added!'); setInviteEmail('') }
    setTimeout(() => setInviteMsg(''), 3000)
  }

  async function handleSaveName() {
    await updateHouseholdName(homeName)
    setEditingName(false)
  }

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input value={homeName} onChange={e => setHomeName(e.target.value)}
                style={{ background: 'var(--surface2)', border: '1px solid var(--accent)', borderRadius: 8, color: 'var(--text)', padding: '6px 10px', fontSize: 20, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', outline: 'none', width: 180 }} />
              <button onClick={handleSaveName} style={{ background: 'none', border: 'none', color: 'var(--accent3)', cursor: 'pointer' }}><Check size={20} /></button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700 }}>{household?.name || 'HomeBase'}</h1>
              <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><Edit2 size={14} /></button>
            </div>
          )}
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Welcome back, {user?.displayName || user?.email?.split('@')[0]}</p>
        </div>
        <button onClick={() => signOut(auth)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', color: 'var(--muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Active', val: active.length, color: 'var(--text)' },
          { label: 'Overdue', val: overdue.length, color: overdue.length > 0 ? '#FF6B6B' : 'var(--text)' },
          { label: 'Completed', val: tasks.filter(t => t.done).length, color: 'var(--accent3)' },
          { label: 'Total Spent', val: `$${totalSpent.toFixed(0)}`, color: 'var(--accent3)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</p>
            <p className="font-display" style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <button onClick={handleEnableNotifications}
        style={{ width: '100%', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 12, padding: '12px 16px', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600, marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
        <Bell size={18} /> Enable push notifications
        {notifStatus && <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>{notifStatus}</span>}
      </button>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#FF6B6B', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> {overdue.length} Overdue
          </p>
          {overdue.slice(0, 3).map(t => (
            <div key={t.id} style={{ background: 'var(--surface)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</p>
              <p style={{ fontSize: 12, color: '#FF6B6B', marginTop: 2 }}>{Math.abs(daysUntil(t.dueDate))}d overdue</p>
            </div>
          ))}
        </div>
      )}

      {/* Due soon */}
      {dueSoon.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#FFD166', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> Due This Week
          </p>
          {dueSoon.slice(0, 3).map(t => (
            <div key={t.id} style={{ background: 'var(--surface)', border: '1px solid rgba(255,209,102,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</p>
              <p style={{ fontSize: 12, color: '#FFD166', marginTop: 2 }}>in {daysUntil(t.dueDate)}d</p>
            </div>
          ))}
        </div>
      )}

      {/* By room */}
      {tasks.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>By Room</p>
          {ROOMS.map(r => {
            const cnt = tasks.filter(t => t.room === r.id && !t.done).length
            const dn = tasks.filter(t => t.room === r.id && t.done).length
            if (cnt + dn === 0) return null
            const pct = Math.round((dn / (cnt + dn)) * 100)
            return (
              <div key={r.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{dn}/{cnt + dn} done</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 999 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 999 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Family members */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
        <button onClick={() => setShowMembers(!showMembers)}
          style={{ width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: 'var(--text)', fontFamily: 'Inter, sans-serif' }}>
          <span style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} /> Household Members ({members.length})
          </span>
          <span style={{ color: 'var(--muted)', fontSize: 20, transform: showMembers ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>›</span>
        </button>

        {showMembers && (
          <div style={{ marginTop: 16 }}>
            {members.map(m => (
              <div key={m.uid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>{m.displayName || m.email}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{m.email}</p>
                </div>
                {m.uid !== user.uid && (
                  <button onClick={() => removeMember(m.uid)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', color: '#FF6B6B', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Remove</button>
                )}
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8 }}>Invite by email</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="email" placeholder="their@email.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                  style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '10px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                <button onClick={handleInvite}
                  style={{ background: 'var(--accent)', border: 'none', borderRadius: 10, padding: '10px 16px', color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Add
                </button>
              </div>
              {inviteMsg && (
                <p style={{ fontSize: 13, color: inviteMsg.includes('!') ? 'var(--accent3)' : '#FF6B6B', marginTop: 8 }}>{inviteMsg}</p>
              )}
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>They must already have a HomeBase account.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
