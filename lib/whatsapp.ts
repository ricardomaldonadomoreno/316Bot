import axios from 'axios'

const WA_API_VERSION = 'v19.0'
const WA_BASE = `https://graph.facebook.com/${WA_API_VERSION}`

export async function sendWhatsAppMessage({
  phoneNumberId,
  token,
  to,
  text,
}: {
  phoneNumberId: string
  token: string
  to: string
  text: string
}) {
  await axios.post(
    `${WA_BASE}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  )
}

export function parseIncomingMessage(body: WhatsAppWebhookBody) {
  try {
    const entry = body.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    const message = value?.messages?.[0]

    if (!message || message.type !== 'text') return null

    return {
      from: message.from,
      text: message.text.body,
      phoneNumberId: value.metadata.phone_number_id,
      timestamp: message.timestamp,
    }
  } catch {
    return null
  }
}

export type WhatsAppWebhookBody = {
  object: string
  entry: Array<{
    id: string
    changes: Array<{
      value: {
        metadata: { phone_number_id: string }
        messages?: Array<{
          from: string
          type: string
          timestamp: string
          text: { body: string }
        }>
      }
      field: string
    }>
  }>
}
