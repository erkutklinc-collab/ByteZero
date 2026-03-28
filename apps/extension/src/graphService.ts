import type { IPublicClientApplication } from '@azure/msal-browser'
import { loginRequest } from './authConfig'

const GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0'

export interface MailMessage {
  id: string
  subject: string
  from?: {
    emailAddress: {
      name: string
      address: string
    }
  }
  receivedDateTime: string
  hasAttachments: boolean
  // internetMessageHeaders can contain size info
  bodyPreview?: string
  // Estimated size in bytes (from Graph API)
  size?: number
}

export interface MailboxScanResult {
  totalEmails: number
  totalSizeBytes: number
  totalSizeMB: number
  withAttachments: number
  withoutAttachments: number
  topSenders: { address: string; count: number }[]
  estimatedCO2grams: number
}

/**
 * Acquire a token silently (or fall back to popup) and call Graph API
 */
async function callGraph(msalInstance: IPublicClientApplication, endpoint: string) {
  const accounts = msalInstance.getAllAccounts()
  if (accounts.length === 0) throw new Error('No accounts found. Please sign in first.')

  let tokenResponse
  try {
    tokenResponse = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    })
  } catch {
    tokenResponse = await msalInstance.acquireTokenPopup(loginRequest)
  }

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${tokenResponse.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Graph API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetch messages in batches using Graph API pagination
 */
export async function scanMailbox(
  msalInstance: IPublicClientApplication,
  onProgress?: (fetched: number) => void,
  maxEmails: number = 500
): Promise<MailboxScanResult> {
  const allMessages: MailMessage[] = []
  // Request top fields we need, fetch in pages of 100
  let nextLink: string | null =
    `${GRAPH_ENDPOINT}/me/messages?$top=100&$select=id,subject,from,receivedDateTime,hasAttachments,bodyPreview&$orderby=receivedDateTime desc`

  while (nextLink && allMessages.length < maxEmails) {
    const data = await callGraph(msalInstance, nextLink)
    const messages: MailMessage[] = data.value || []
    allMessages.push(...messages)

    onProgress?.(allMessages.length)

    nextLink = data['@odata.nextLink'] || null
  }

  // Process results
  const senderMap = new Map<string, number>()
  let withAttachments = 0

  for (const msg of allMessages) {
    if (msg.hasAttachments) withAttachments++
    const senderAddr = msg.from?.emailAddress?.address || 'unknown'
    senderMap.set(senderAddr, (senderMap.get(senderAddr) || 0) + 1)
  }

  // Sort senders by frequency
  const topSenders = Array.from(senderMap.entries())
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Estimate email sizes (Graph doesn't always return size in list queries)
  // Average email: ~75KB without attachment, ~300KB with attachment
  const AVG_SIZE_NO_ATTACHMENT = 75 * 1024    // 75 KB
  const AVG_SIZE_WITH_ATTACHMENT = 300 * 1024  // 300 KB
  const totalSizeBytes =
    (allMessages.length - withAttachments) * AVG_SIZE_NO_ATTACHMENT +
    withAttachments * AVG_SIZE_WITH_ATTACHMENT
  const totalSizeMB = totalSizeBytes / (1024 * 1024)

  // CO2 estimate: ~0.3g CO2 per email stored (industry average)
  // Emails with attachments: ~4g CO2
  const estimatedCO2grams =
    (allMessages.length - withAttachments) * 0.3 + withAttachments * 4

  return {
    totalEmails: allMessages.length,
    totalSizeBytes,
    totalSizeMB: Math.round(totalSizeMB * 100) / 100,
    withAttachments,
    withoutAttachments: allMessages.length - withAttachments,
    topSenders,
    estimatedCO2grams: Math.round(estimatedCO2grams * 100) / 100,
  }
}
