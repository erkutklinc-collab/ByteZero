import { PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './authConfig'

const msalInstance = new PublicClientApplication(msalConfig)

async function handleAuth() {
  await msalInstance.initialize()

  // Step 2: If Microsoft redirected back with a code, exchange it for a token
  const response = await msalInstance.handleRedirectPromise()

  if (response && response.accessToken) {
    // Send the token back to the task pane via Office Dialog messaging
    Office.context.ui.messageParent(
      JSON.stringify({ status: 'success', token: response.accessToken })
    )
    document.body.innerHTML = '<p style="color:#34d399;font-size:16px;text-align:center;margin-top:40px">✓ Signed in! This window will close shortly.</p>'
    return
  }

  // Step 1: First load — no code in URL yet, so redirect to Microsoft login
  if (window.location.hash) {
    // Hash exists but no token — something went wrong
    document.body.innerHTML = '<p style="color:#f87171">Token exchange failed. Please close and try again.</p>'
    return
  }

  // Kick off the redirect to Microsoft login
  document.body.innerHTML = '<p style="color:#34d399">Redirecting to Microsoft login...</p>'
  await msalInstance.loginRedirect({
    scopes: ['Mail.Read'],
    prompt: 'select_account'
  })
}

// Wait for Office to be ready before running
Office.onReady(() => {
  handleAuth().catch(err => {
    document.body.innerHTML = `<p style="color:#f87171">Error: ${err.message || err}</p>`
  })
})
