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
  bodyPreview?: string
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
 * Call the Graph API with the given access token
 */
async function callGraph(accessToken: string, endpoint: string) {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
  accessToken: string,
  onProgress?: (fetched: number) => void,
  maxEmails: number = 500
): Promise<MailboxScanResult> {
  const allMessages: MailMessage[] = []
  let nextLink: string | null =
    `${GRAPH_ENDPOINT}/me/messages?$top=100&$select=id,subject,from,receivedDateTime,hasAttachments,bodyPreview&$orderby=receivedDateTime desc`

  while (nextLink && allMessages.length < maxEmails) {
    const data = await callGraph(accessToken, nextLink)
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

  const topSenders = Array.from(senderMap.entries())
    .map(([address, count]) => ({ address, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Estimate sizes
  const AVG_SIZE_NO_ATTACHMENT = 75 * 1024
  const AVG_SIZE_WITH_ATTACHMENT = 300 * 1024
  const totalSizeBytes =
    (allMessages.length - withAttachments) * AVG_SIZE_NO_ATTACHMENT +
    withAttachments * AVG_SIZE_WITH_ATTACHMENT
  const totalSizeMB = totalSizeBytes / (1024 * 1024)

  // CO2 estimate: ~0.3g per email, ~4g with attachments
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
