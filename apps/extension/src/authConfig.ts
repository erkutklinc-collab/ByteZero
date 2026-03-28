import type { Configuration, PopupRequest } from '@azure/msal-browser'

const CLIENT_ID = import.meta.env.VITE_AZURE_CLIENT_ID

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: 'https://login.microsoftonline.com/' + import.meta.env.VITE_AZURE_TENANT_ID,
    redirectUri: 'https://localhost:3000/auth-end.html',
    // @ts-ignore: This option exists at runtime and prevents double-redirects
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
}

export const loginRequest: PopupRequest = {
  scopes: ['Mail.Read'],
}

export const graphScopes = {
  messages: ['Mail.Read'],
}
