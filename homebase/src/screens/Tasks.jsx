import { useState } from 'react'
import { Plus, X, Check, Trash2, Calendar, AlertTriangle } from 'lucide-react'

const ROOMS = [
  { id: 'kitchen', label: 'Kitchen' }, { id: 'bathroom', label: 'Bathroom' },
  { id: 'electrical', label: 'Electrical' }, { id: 'hvac', label: 'HVAC' },
  { id: 'exterior', label: 'Exterior' }, { id: 'garage', label: 'Garage' },
  { id: 'roof', label: 'Roof' }, { id: 'other', label: 'Other' },
]
const PRIOS = ['High', 'Medium', 'Low']
const RECUR = { none: 'One-time', monthly: 'Monthly', quarterly: 'Quarterly', biannual: 'Every 6 mo', annual: 'Annual' }

function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(d) - new Date()) / 864e5) }

function StatusPill({ task }) {
  if (task.done) return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(139,143,173,0.15)', color: 'var(--muted)' }}>Done</span>
  const d = daysUntil(task.dueDate)
  if (d === null) return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(139,143,173,0.15)', color: 'var(--muted)' }}>No date</span>
  if (d < 0) return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,107,107,0.12)', color: '#FF6B6B' }}>{Math.abs(d)}d overdue</span>
  if (d <= 7) return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,209,102,0.12)', color: '#FFD166' }}>{d}d left</span>
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'rgba(67,233,123,0.12)', color: 'var(--accent3)' }}>{d}d left</span>
}

function AddTaskModal({ onClose, onSave, defaultRoom }) {
  const [form, setForm] = useState({ title: '', room: defaultRoom || 'kitchen', dueDate: '', priority: 'Medium', notes: '', recurrence: 'none' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', padding: 24, width: '100%', maxHeight: '90dvh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>New Task</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={22} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="What needs doing?" value={form.title} onChange={e => set('title', e.target.value)} autoFocus
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '12px 14px', fontSize: 15, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Room / Area</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ROOMS.map(r => (
                <button key={r.id} onClick={() => set('room', r.id)}
                  style={{ padding: '6px 14px', borderRadius: 999, border: '1px solid', borderColor: form.room === r.id ? 'var(--accent)' : 'var(--border)', background: form.room === r.id ? 'rgba(108,99,255,0.15)' : 'var(--surface2)', color: form.room === r.id ? 'var(--accent)' : 'var(--muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, display: 'block', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '10px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, display: 'block', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '10px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%' }}>
                {PRIOS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, display: 'block', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Recurrence</label>
            <select value={form.recurrence} onChange={e => set('recurrence', e.target.value)}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '10px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%' }}>
              {Object.entries(RECUR).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'none' }} />
          <button onClick={() => { if (form.title.trim()) { onSave(form); onClose() } }}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
            Add Task
          </button>
        </div>
      </div>
    </div>
  )
}

function LogModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({ cost: '', notes: '', date: new Date().toISOString().split('T')[0] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ background: 'var(--surface)', borderRadius: '24px 24px 0 0', border: '1px solid var(--border)', borderBottom: 'none', padding: 24, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Log Repair</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}><X size={22} /></button>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>{task.title}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, display: 'block', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Date Completed</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '10px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6, display: 'block', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase' }}>Cost ($)</label>
            <input type="number" placeholder="0.00" value={form.cost} onChange={e => set('cost', e.target.value)}
              style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '10px 12px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', width: '100%' }} />
          </div>
          <textarea placeholder="What was done? Parts? Who did the work?" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif', resize: 'none' }} />
          <button onClick={() => { onSave(form, task.id); onClose() }}
            style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            Save Log
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TasksScreen({ tasks, addTask, toggleTask, deleteTask, addLog }) {
  const [activeRoom, setActiveRoom] = useState('all')
  const [filter, setFilter] = useState('active')
  const [showAdd, setShowAdd] = useState(false)
  const [logTask, setLogTask] = useState(null)

  const filtered = tasks.filter(t => {
    if (activeRoom !== 'all' && t.room !== activeRoom) return false
    if (filter === 'active') return !t.done
    if (filter === 'done') return t.done
    return true
  }).sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const p = { High: 0, Medium: 1, Low: 2 }
    if (a.priority !== b.priority) return p[a.priority] - p[b.priority]
    return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999')
  })

  const overdue = tasks.filter(t => !t.done && daysUntil(t.dueDate) < 0).length

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Tasks</h1>
      {overdue > 0 && (
        <div style={{ marginBottom: 14, padding: '8px 12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#FF6B6B', fontWeight: 500 }}>
          <AlertTriangle size={14} /> {overdue} task{overdue > 1 ? 's' : ''} overdue
        </div>
      )}

      {/* Room filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        {[{ id: 'all', label: 'All' }, ...ROOMS].map(r => (
          <button key={r.id} onClick={() => setActiveRoom(r.id)}
            style={{ padding: '6px 16px', borderRadius: 999, border: '1px solid', borderColor: activeRoom === r.id ? 'var(--accent)' : 'var(--border)', background: activeRoom === r.id ? 'rgba(108,99,255,0.2)' : 'var(--surface2)', color: activeRoom === r.id ? 'var(--accent)' : 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif' }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['active', 'done', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '5px 14px', borderRadius: 8, border: '1px solid', borderColor: filter === f ? 'var(--accent)' : 'var(--border)', background: filter === f ? 'rgba(108,99,255,0.15)' : 'transparent', color: filter === f ? 'var(--accent)' : 'var(--muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🏠</p>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>No tasks here. Tap + to add one.</p>
        </div>
      ) : filtered.map(task => (
        <div key={task.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', marginBottom: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <button onClick={() => toggleTask(task.id, task.done)}
            style={{ width: 24, height: 24, borderRadius: 7, border: task.done ? 'none' : '2px solid var(--border)', background: task.done ? 'var(--accent3)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}>
            {task.done && <Check size={14} color="#0F1117" strokeWidth={3} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{ROOMS.find(r => r.id === task.room)?.label || 'Other'}</span>
              <StatusPill task={task} />
              {task.priority === 'High' && <AlertTriangle size={12} color="#FF6B6B" />}
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: task.done ? 'var(--muted)' : 'var(--text)', textDecoration: task.done ? 'line-through' : 'none', marginBottom: 4 }}>{task.title}</p>
            {task.notes && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{task.notes}</p>}
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
              {task.dueDate && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} /> {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
              {task.recurrence && task.recurrence !== 'none' && <span>↻ {RECUR[task.recurrence]}</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {!task.done && (
              <button onClick={() => setLogTask(task)}
                style={{ background: 'rgba(108,99,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 10px', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Log
              </button>
            )}
            <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', padding: 4 }}><Trash2 size={15} /></button>
          </div>
        </div>
      ))}

      {/* FAB */}
      <button onClick={() => setShowAdd(true)}
        style={{ position: 'fixed', bottom: 80, right: 20, width: 56, height: 56, borderRadius: 16, background: 'var(--accent)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(108,99,255,0.4)', zIndex: 99 }}>
        <Plus size={24} />
      </button>

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} onSave={addTask} defaultRoom={activeRoom !== 'all' ? activeRoom : 'kitchen'} />}
      {logTask && <LogModal task={logTask} onClose={() => setLogTask(null)} onSave={addLog} />}
    </div>
  )
}
