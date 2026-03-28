import { PublicClientApplication } from '@azure/msal-browser'

// This script runs inside the Office dialog opened by the task pane.
// It performs MSAL login via redirect, then sends the token back to the parent.

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + '/redirect.html',
  },
}

const msalInstance = new PublicClientApplication(msalConfig)

async function run() {
  await msalInstance.initialize()

  // Check if this is a redirect back from Microsoft login
  const response = await msalInstance.handleRedirectPromise()

  if (response && response.accessToken) {
    // Success! Send the token back to the parent task pane via Office messaging
    Office.context.ui.messageParent(
      JSON.stringify({ status: 'success', token: response.accessToken }),
      { targetOrigin: '*' }
    )
    return
  }

  // Check if we already have an account cached
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length > 0) {
    try {
      const tokenResponse = await msalInstance.acquireTokenSilent({
        scopes: ['Mail.Read'],
        account: accounts[0],
      })
      Office.context.ui.messageParent(
        JSON.stringify({ status: 'success', token: tokenResponse.accessToken }),
        { targetOrigin: '*' }
      )
      return
    } catch {
      // Silent acquisition failed, fall through to redirect
    }
  }

  // No token yet — redirect to Microsoft login
  await msalInstance.acquireTokenRedirect({
    scopes: ['Mail.Read'],
  })
}

Office.onReady(() => {
  run()
})
