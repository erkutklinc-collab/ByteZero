import { PublicClientApplication } from '@azure/msal-browser'

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin + '/redirect.html',
  },
}

const msalInstance = new PublicClientApplication(msalConfig)

function log(msg: string) {
  const p = document.createElement('p')
  p.style.fontSize = '12px'
  p.style.color = '#fff'
  p.textContent = msg
  document.body.appendChild(p)
}

async function run() {
  try {
    log('Initializing MSAL...')
    await msalInstance.initialize()

    log('Checking for redirect response...')
    const response = await msalInstance.handleRedirectPromise()

    if (response && response.accessToken) {
      log('Success! Got token. Sending to parent...')
      Office.context.ui.messageParent(
        JSON.stringify({ status: 'success', token: response.accessToken }),
        { targetOrigin: '*' }
      )
      return
    }

    const accounts = msalInstance.getAllAccounts()
    log(`Found ${accounts.length} cached accounts`)
    
    if (accounts.length > 0) {
      try {
        log('Attempting silent token acquisition...')
        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: ['Mail.Read'],
          account: accounts[0],
        })
        log('Silent auth success! Sending token...')
        Office.context.ui.messageParent(
          JSON.stringify({ status: 'success', token: tokenResponse.accessToken }),
          { targetOrigin: '*' }
        )
        return
      } catch (err: any) {
        log(`Silent auth failed: ${err.message}`)
      }
    }

    log('Redirecting to Microsoft login...')
    await msalInstance.acquireTokenRedirect({
      scopes: ['Mail.Read'],
      prompt: 'select_account'
    })
  } catch (err: any) {
    log(`CRITICAL ERROR: ${err.toString()}`)
    setTimeout(() => {
      Office.context.ui.messageParent(
        JSON.stringify({ status: 'error', error: err.toString() }),
        { targetOrigin: '*' }
      )
    }, 3000)
  }
}

Office.onReady(() => {
  run()
})