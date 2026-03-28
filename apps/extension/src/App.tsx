import { useState, useEffect } from 'react'

function App() {
  const [status, setStatus] = useState<string>('Not connected')
  const [emailInfo, setEmailInfo] = useState<{subject?: string, sender?: string} | null>(null)

  useEffect(() => {
    // If we're inside the Outlook Context, we can preemptively grab the current item
    if (typeof Office !== 'undefined' && Office.context && Office.context.mailbox) {
      const item = Office.context.mailbox.item
      if (item) {
        setEmailInfo({
          subject: item.subject,
          sender: item.sender?.emailAddress
        })
      }
    }
  }, [])

  const handleLogin = async () => {
    setStatus('Connecting to Microsoft Graph...')
    try {
      // Placeholder for MSAL initialization:
      // When tracking the full mailbox footprint, MSAL will be used to 
      // authorize and query the Microsoft Graph API (/me/messages)
      setStatus('Waiting for Microsoft Authentication setup with an Azure AD App Registration.')
    } catch (error) {
      setStatus(`Error: ${error}`)
    }
  }

  const handleScanCurrent = () => {
    if (emailInfo) {
      setStatus(`Scanned current email: "${emailInfo.subject}" from ${emailInfo.sender}.`)
    } else {
      setStatus('No email is currently selected or Office context not available.')
    }
  }

  return (
    <div className="App">
      <div className="brand-title">ByteFootprint</div>
      
      <div className="glass-panel">
        <h2 style={{ fontSize: '20px', margin: '0 0 12px 0', color: '#fff', fontWeight: 600 }}>Outlook Connector</h2>
        <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: '1.5' }}>
          Connect your Microsoft account to securely scan your mailbox for its digital carbon footprint.
        </p>

        <button className="primary-btn" onClick={handleLogin}>
          Authenticate with Microsoft
        </button>

        <button className="primary-btn" onClick={handleScanCurrent} style={{background: 'var(--color-surface)', border: '1px solid var(--color-brand-500)', marginTop: '12px'}}>
          Scan Current Email
        </button>

        <p className="status-text">{status}</p>
      </div>
    </div>
  )
}

export default App
