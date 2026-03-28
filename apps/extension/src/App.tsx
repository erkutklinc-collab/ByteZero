import { useState } from 'react'
import { scanMailbox } from './graphService'
import type { MailboxScanResult } from './graphService'

function App() {
  const [status, setStatus] = useState<string>('Not connected')
  const [scanning, setScanning] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [result, setResult] = useState<MailboxScanResult | null>(null)

  const handleLogin = () => {
    setStatus('Opening Microsoft login...')

    // Use Office Dialog API to open login page in a separate window
    Office.context.ui.displayDialogAsync(
      window.location.origin + '/redirect.html',
      { height: 60, width: 30 },
      (asyncResult) => {
        if (asyncResult.status === Office.AsyncResultStatus.Failed) {
          setStatus(`Login dialog failed: ${asyncResult.error.message}`)
          return
        }

        const dialog = asyncResult.value
        dialog.addEventHandler(
          Office.EventType.DialogMessageReceived,
          (arg: { message?: string; error?: number }) => {
            dialog.close()
            if (arg.message) {
              try {
                const data = JSON.parse(arg.message)
                if (data.status === 'success' && data.token) {
                  setAccessToken(data.token)
                  setStatus('Authenticated! Ready to scan your mailbox.')
                } else {
                  setStatus(`Login failed: ${data.error || 'Unknown error'}`)
                }
              } catch {
                setStatus('Login failed: Could not parse response.')
              }
            }
          }
        )

        dialog.addEventHandler(
          Office.EventType.DialogEventReceived,
          () => {
            setStatus('Login dialog was closed.')
          }
        )
      }
    )
  }

  const handleLogout = () => {
    setAccessToken(null)
    setResult(null)
    setStatus('Not connected')
  }

  const handleScan = async () => {
    if (!accessToken) return
    setScanning(true)
    setResult(null)
    setStatus('Scanning mailbox...')

    try {
      const scanResult = await scanMailbox(accessToken, (count) => {
        setStatus(`Scanning... ${count} emails fetched`)
      }, 500)

      setResult(scanResult)
      setStatus(`Scan complete — ${scanResult.totalEmails} emails analyzed.`)
    } catch (error) {
      setStatus(`Scan failed: ${error}`)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="App">
      <div className="brand-title">ByteFootprint</div>

      <div className="glass-panel">
        <h2 className="panel-heading">Outlook Connector</h2>

        {!accessToken ? (
          <>
            <p className="panel-description">
              Connect your Microsoft account to securely scan your entire mailbox for its digital carbon footprint.
            </p>
            <button className="primary-btn" onClick={handleLogin}>
              Authenticate with Microsoft
            </button>
          </>
        ) : (
          <>
            <p className="panel-description" style={{ color: '#6ee7b7' }}>
              ✓ Authenticated
            </p>
            <button
              className="primary-btn"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? 'Scanning...' : 'Scan Mailbox'}
            </button>
            <button
              className="secondary-btn"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </>
        )}

        <p className="status-text">{status}</p>
      </div>

      {result && (
        <div className="glass-panel" style={{ marginTop: '16px' }}>
          <h2 className="panel-heading">Scan Results</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{result.totalEmails}</span>
              <span className="stat-label">Emails Scanned</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{result.totalSizeMB}</span>
              <span className="stat-label">Est. Size (MB)</span>
            </div>
            <div className="stat-card highlight">
              <span className="stat-value">{result.estimatedCO2grams}</span>
              <span className="stat-label">CO₂ (grams)</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{result.withAttachments}</span>
              <span className="stat-label">With Attachments</span>
            </div>
          </div>

          {result.topSenders.length > 0 && (
            <>
              <h3 className="section-heading">Top Senders</h3>
              <ul className="sender-list">
                {result.topSenders.slice(0, 5).map((s, i) => (
                  <li key={i} className="sender-item">
                    <span className="sender-address">{s.address}</span>
                    <span className="sender-count">{s.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
