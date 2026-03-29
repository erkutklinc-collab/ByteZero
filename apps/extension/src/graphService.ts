
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

export interface ActionableTask {
  id: string
  type: 'DELETE' | 'UNSUBSCRIBE'
  title: string
  description: string
  impactCO2grams: number
  targetSender?: string
}

export interface MailboxScanResult {
  totalEmails: number
  totalSizeBytes: number
  totalSizeMB: number
  withAttachments: number
  withoutAttachments: number
  topSenders: { address: string; count: number }[]
  estimatedCO2grams: number
  tasks: ActionableTask[]
}

/**
 * Mock function to simulate fetching mailbox data
 */
export async function scanMailbox(
  onProgress?: (fetched: number) => void
): Promise<MailboxScanResult> {
  // Simulate network delay and progress
  const totalEmails = Math.floor(Math.random() * 200) + 300 // 300-500 emails
  const steps = 5
  const batchSize = Math.floor(totalEmails / steps)

  for (let i = 1; i <= steps; i++) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    onProgress?.(Math.min(i * batchSize, totalEmails))
  }

  // Generate mock senders
  const topSenders = [
    { address: 'newsletters@techcrunch.com', count: 42 },
    { address: 'no-reply@amazon.com', count: 28 },
    { address: 'notifications@github.com', count: 25 },
    { address: 'marketing@linkedin.com', count: 18 },
    { address: 'jira@company.atlassian.net', count: 15 },
  ]

  const withAttachments = Math.floor(totalEmails * 0.15) // 15% have attachments
  
  // Estimate sizes
  const AVG_SIZE_NO_ATTACHMENT = 75 * 1024
  const AVG_SIZE_WITH_ATTACHMENT = 300 * 1024
  const totalSizeBytes =
    (totalEmails - withAttachments) * AVG_SIZE_NO_ATTACHMENT +
    withAttachments * AVG_SIZE_WITH_ATTACHMENT
  const totalSizeMB = totalSizeBytes / (1024 * 1024)

  // CO2 estimate: ~0.3g per email, ~4g with attachments
  const estimatedCO2grams =
    (totalEmails - withAttachments) * 0.3 + withAttachments * 4

  // Generate actionable tasks
  const tasks: ActionableTask[] = [
    {
      id: 'task-1',
      type: 'UNSUBSCRIBE',
      title: 'Unsubscribe from TechCrunch',
      description: 'You have received 42 notifications this month. Unsubscribe to save energy on constant fetching.',
      impactCO2grams: 12.6, // 42 * 0.3
      targetSender: 'newsletters@techcrunch.com'
    },
    {
      id: 'task-2',
      type: 'DELETE',
      title: 'Delete Old Amazon Notifications',
      description: 'Clear 28 emails from no-reply@amazon.com that are over 6 months old.',
      impactCO2grams: 8.4, // 28 * 0.3
      targetSender: 'no-reply@amazon.com'
    },
    {
      id: 'task-3',
      type: 'UNSUBSCRIBE',
      title: 'Unsubscribe from LinkedIn Marketing',
      description: 'You have received 18 marketing emails. Unsubscribe to reduce future delivery emissions.',
      impactCO2grams: 5.4,
      targetSender: 'marketing@linkedin.com'
    },
    {
      id: 'task-4',
      type: 'DELETE',
      title: 'Clear Jira Activity Logs',
      description: 'You have 15 Jira notifications. These are often redundant once the task is closed.',
      impactCO2grams: 4.5,
      targetSender: 'jira@company.atlassian.net'
    },
    {
      id: 'task-5',
      type: 'DELETE',
      title: 'Delete Large Attachments (Old)',
      description: 'Cleanup identified 12 high-impact legacy emails with attachments.',
      impactCO2grams: 48.0, // 12 * 4.0
    }
  ]

  return {
    totalEmails,
    totalSizeBytes,
    totalSizeMB: Math.round(totalSizeMB * 100) / 100,
    withAttachments,
    withoutAttachments: totalEmails - withAttachments,
    topSenders,
    estimatedCO2grams: Math.round(estimatedCO2grams * 100) / 100,
    tasks
  }
}
