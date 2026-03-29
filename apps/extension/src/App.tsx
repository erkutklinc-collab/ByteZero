import { useState } from 'react'
import { scanMailbox } from './graphService'
import type { MailboxScanResult } from './graphService'

// Native AudioContext synthesizer for a clean "chime" sound
const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1) // A5

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.5)
  } catch (e) {
    console.error('AudioContext failed:', e)
  }
}

const API_URL = 'http://localhost:3001'
const USER_ID = 1 // Alex Carter (added to seed)

function App() {
  const [status, setStatus] = useState<string>('Not connected')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<MailboxScanResult | null>(null)
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set())

  // Gamification state
  const [xp, setXp] = useState(30)
  const [level, setLevel] = useState(1)
  const [showLevelUp, setShowLevelUp] = useState(false)

  const handleScan = async () => {
    setScanning(true)
    setResult(null)
    setCompletedTaskIds(new Set())
    setStatus('Scanning mailbox...')

    try {
      const scanResult = await scanMailbox((count) => {
        setStatus(`Scanning... ${count} emails fetched`)
      })

      setResult(scanResult)
      setStatus(`Scan complete — ${scanResult.totalEmails} emails analyzed.`)
    } catch (error) {
      setStatus(`Scan failed: ${error}`)
    } finally {
      setScanning(false)
    }
  }

  const handleRunTask = async (task: any) => {
    const { id, impactCO2grams, type } = task
    setCompletedTaskIds(prev => new Set(prev).add(id))
    setStatus(`Task completed! Saved ${impactCO2grams}g of CO2 emissions.`)

    // Play sound
    playSuccessSound()

    // Map task type to backend event type
    const eventType = type === 'DELETE' ? 'email_deleted' : 'unsubscribe_action'

    // Report to backend
    try {
      await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          eventType,
          co2Grams: impactCO2grams,
          metadata: { taskId: id, title: task.title }
        })
      })
      console.log(`Impact reported for ${id}`)
    } catch (e) {
      console.error('Failed to report impact to dashboard:', e)
    }

    // Update XP and Level
    setXp(prevXp => {
      const newXp = prevXp + 40
      if (newXp >= 100) {
        setLevel(prevLevel => prevLevel + 1)
        setShowLevelUp(true)
        setTimeout(() => setShowLevelUp(false), 3000)
        return newXp - 100
      }
      return newXp
    })

    // Auto-clear status after 3 seconds
    setTimeout(() => {
      setStatus(prev => prev.includes('Saved') ? 'Ready for more optimizations.' : prev)
    }, 3000)
  }

  // Find the next task to display (the stack logic)
  const nextTask = result?.tasks.find(t => !completedTaskIds.has(t.id))
  const completedCount = completedTaskIds.size
  const totalTasks = result?.tasks.length || 0

  // Calculate adjusted results based on completed tasks
  const getAdjustedResults = () => {
    if (!result) return null

    let totalEmails = result.totalEmails
    let totalCO2 = result.estimatedCO2grams

    result.tasks.forEach(task => {
      if (completedTaskIds.has(task.id)) {
        totalCO2 -= task.impactCO2grams
        // For mock simplicity, we assume DELETE tasks identify specific email counts
        if (task.type === 'DELETE') {
          if (task.id === 'task-2') totalEmails -= 28
          if (task.id === 'task-4') totalEmails -= 15
          if (task.id === 'task-5') totalEmails -= 12
        }
      }
    })

    return {
      ...result,
      totalEmails: Math.max(0, totalEmails),
      estimatedCO2grams: Math.round(Math.max(0, totalCO2) * 100) / 100
    }
  }

  const adjustedResult = getAdjustedResults()

  return (
    <div className="App">
      <div className="logo-container">
        <img src="/logo.png" alt="ByteZero Logo" className="brand-logo" />
      </div>

      {/* Level Bar (Always Visible) */}
      <div className="glass-panel level-container">
        <div className="level-header">
          <span className="level-label">Level {level}</span>
          <span className="xp-label">{xp}/100 XP</span>
        </div>
        <div className="level-bar-bg">
          <div className="level-bar-fill" style={{ width: `${xp}%` }}></div>
        </div>
      </div>

      {showLevelUp && (
        <div className="level-up-toast">
          <span className="toast-icon">✨</span>
          <div className="toast-content">
            <span className="toast-title">Level Up!</span>
            <span className="toast-desc">You've reached Level {level}!</span>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ marginTop: '16px' }}>
        <h2 className="panel-heading">Outlook Connector</h2>

        <p className="panel-description">
          Analyze your mailbox to securely calculate its digital carbon footprint and environmental impact.
        </p>

        <button
          className="primary-btn"
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? 'Scanning...' : 'Scan Mailbox'}
        </button>

        <p className="status-text">{status}</p>
      </div>

      {adjustedResult && (
        <>
          <div className="glass-panel" style={{ marginTop: '16px' }}>
            <h2 className="panel-heading">Scan Results</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{adjustedResult.totalEmails}</span>
                <span className="stat-label">Emails Scanned</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{adjustedResult.totalSizeMB}</span>
                <span className="stat-label">Est. Size (MB)</span>
              </div>
              <div className="stat-card highlight">
                <span className="stat-value">{adjustedResult.estimatedCO2grams}</span>
                <span className="stat-label">CO₂ (grams)</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{adjustedResult.withAttachments}</span>
                <span className="stat-label">With Attachments</span>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ marginTop: '16px' }}>
            <div className="panel-header-flex">
              <h2 className="panel-heading">Recommendations</h2>
              {totalTasks > 0 && (
                <span className="task-progress">
                  {completedCount === totalTasks ? 'All Done!' : `${completedCount + 1} of ${totalTasks}`}
                </span>
              )}
            </div>

            {nextTask ? (
              <div className="task-list">
                <div key={nextTask.id} className="task-card current-task">
                  <div className="task-header">
                    <span className="task-badge">{nextTask.type}</span>
                    <span className="task-impact">-{nextTask.impactCO2grams}g CO₂</span>
                  </div>
                  <h3 className="task-title">{nextTask.title}</h3>
                  <p className="task-desc">{nextTask.description}</p>
                  <button
                    className="task-btn"
                    onClick={() => handleRunTask(nextTask)}
                  >
                    Run Optimization
                  </button>
                </div>
              </div>
            ) : (
              <div className="all-clear">
                <div className="success-icon">✓</div>
                <p className="all-clear-text">You've completed all recommendations! Your mailbox is optimized.</p>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ marginTop: '16px' }}>
            <h3 className="section-heading">Top Senders</h3>
            <ul className="sender-list">
              {adjustedResult.topSenders.slice(0, 5).map((s, i) => (
                <li key={i} className="sender-item">
                  <span className="sender-address">{s.address}</span>
                  <span className="sender-count">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

export default App
