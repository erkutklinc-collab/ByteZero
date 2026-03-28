import { useState } from 'react'
import { useMsal, useIsAuthenticated } from '@azure/msal-react'
import { loginRequest } from './authConfig'
import { scanMailbox } from './graphService'
import type { MailboxScanResult } from './graphService'

function App() {
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [status, setStatus] = useState<string>('Not connected')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<MailboxScanResult | null>(null)

  const handleLogin = async () => {
    try {
      setStatus('Opening Microsoft login...')
      await instance.loginPopup(loginRequest)
      setStatus('Authenticated! Ready to scan your mailbox.')
    } catch (error) {
      setStatus(`Login failed: ${error}`)
    }
  }

  const handleLogout = async () => {
    await instance.logoutPopup()
    setResult(null)
    setStatus('Not connected')
  }

  const handleScan = async () => {
    setScanning(true)
    setResult(null)
    setStatus('Scanning mailbox...')

    try {
      const scanResult = await scanMailbox(instance, (count) => {
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

      {/* Auth panel */}
      <div className="glass-panel">
        <h2 className="panel-heading">Outlook Connector</h2>

        {!isAuthenticated ? (
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

      {/* Results panel */}
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
