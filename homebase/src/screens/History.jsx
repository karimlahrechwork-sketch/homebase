const ROOMS = [
  { id: 'kitchen', label: 'Kitchen' }, { id: 'bathroom', label: 'Bathroom' },
  { id: 'electrical', label: 'Electrical' }, { id: 'hvac', label: 'HVAC' },
  { id: 'exterior', label: 'Exterior' }, { id: 'garage', label: 'Garage' },
  { id: 'roof', label: 'Roof' }, { id: 'other', label: 'Other' },
]

export default function HistoryScreen({ logs, members }) {
  const sorted = [...logs].sort((a, b) => {
    const ta = a.loggedAt?.toDate ? a.loggedAt.toDate() : new Date(a.loggedAt || 0)
    const tb = b.loggedAt?.toDate ? b.loggedAt.toDate() : new Date(b.loggedAt || 0)
    return tb - ta
  })
  const total = sorted.reduce((s, l) => s + (parseFloat(l.cost) || 0), 0)

  function getMember(uid) { return members.find(m => m.uid === uid) }
  function fmtDate(d) {
    if (!d) return ''
    const date = d?.toDate ? d.toDate() : new Date(d)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ padding: '20px 16px 100px' }}>
      <h1 className="font-display" style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>History</h1>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>All completed repairs & maintenance</p>

      {sorted.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 4 }}>Total Spent</p>
          <p className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent3)' }}>${total.toFixed(2)}</p>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{sorted.length} repair{sorted.length !== 1 ? 's' : ''} logged</p>
        </div>
      )}

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>No repairs logged yet. Complete a task to start tracking.</p>
        </div>
      ) : sorted.map(log => {
        const room = ROOMS.find(r => r.id === log.room) || ROOMS[7]
        const member = getMember(log.loggedBy)
        return (
          <div key={log.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{room.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>· {fmtDate(log.date)}</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{log.taskTitle}</p>
                {log.notes && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>{log.notes}</p>}
                {member && (
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>by {member.displayName || member.email}</p>
                )}
              </div>
              {log.cost && (
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent3)', flexShrink: 0, marginLeft: 12 }}>${parseFloat(log.cost).toFixed(2)}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
