import type { Configuration, PopupRequest } from '@azure/msal-browser'

// ============================================================
// ⚠️  REPLACE this with your Azure AD App Registration Client ID
// 
// To get one:
//   1. Go to https://portal.azure.com → "App registrations" → "New registration"
//   2. Name: "ByteFootprint Outlook Add-in"
//   3. Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
//   4. Redirect URI: Select "Single-page application (SPA)" and enter: https://localhost:3000
//   5. Click "Register"
//   6. Copy the "Application (client) ID" and paste it below
//   7. Go to "API permissions" → "Add a permission" → "Microsoft Graph" → "Delegated" → add "Mail.Read"
// ============================================================
const CLIENT_ID = 'YOUR_AZURE_AD_CLIENT_ID'

export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'https://localhost:3000',
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
