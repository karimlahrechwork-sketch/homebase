import { useState } from 'react'
import { BarChart2, ClipboardList, Clock } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useHousehold } from './hooks/useHousehold'
import AuthScreen from './screens/Auth'
import HomeScreen from './screens/Home'
import TasksScreen from './screens/Tasks'
import HistoryScreen from './screens/History'

export default function App() {
  const user = useAuth()
  const [tab, setTab] = useState('home')
  const {
    household, tasks, logs, members, loading,
    addTask, toggleTask, deleteTask, addLog,
    inviteMember, removeMember, updateHouseholdName,
  } = useHousehold(user || null)

  // Still checking auth state
  if (user === undefined) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🏠</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user) return <AuthScreen />

  // Loading household
  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🏠</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Setting up your home...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      {tab === 'home' && (
        <HomeScreen
          user={user} household={household} tasks={tasks} logs={logs} members={members}
          inviteMember={inviteMember} removeMember={removeMember} updateHouseholdName={updateHouseholdName}
        />
      )}
      {tab === 'tasks' && (
        <TasksScreen tasks={tasks} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} addLog={addLog} />
      )}
      {tab === 'history' && (
        <HistoryScreen logs={logs} members={members} />
      )}

      {/* Tab bar */}
      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', zIndex: 100 }}>
        {[
          { id: 'home', label: 'Home', Icon: BarChart2 },
          { id: 'tasks', label: 'Tasks', Icon: ClipboardList },
          { id: 'history', label: 'History', Icon: Clock },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0 14px', gap: 4, fontSize: 10, fontWeight: 600, letterSpacing: '.05em', color: tab === id ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', border: 'none', background: 'none', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', transition: 'color .15s' }}>
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
