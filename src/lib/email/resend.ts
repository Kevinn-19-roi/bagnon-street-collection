import { Resend } from 'resend'

type SendEmailInput = {
  to: string | string[] | null | undefined
  subject: string
  html: string
  text?: string
  replyTo?: string | null
  idempotencyKey?: string
}

const FROM = 'Bagnon Street <no-reply@bagnon-street.com>'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

function normalizeRecipients(to: SendEmailInput['to']) {
  return Array.isArray(to) ? to.filter(Boolean) : to ? [to] : []
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const recipients = normalizeRecipients(input.to)
  if (recipients.length === 0) return { skipped: true, reason: 'missing-recipient' }

  const resend = getResendClient()
  if (!resend) {
    console.info('[email] RESEND_API_KEY missing; email skipped:', input.subject)
    return { skipped: true, reason: 'missing-api-key' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: recipients,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo || undefined,
    }, input.idempotencyKey ? {
      headers: { 'Idempotency-Key': input.idempotencyKey },
    } : undefined)

    if (error) {
      console.error('[email] send failed:', { subject: input.subject, message: error.message })
      return { skipped: false, error: error.message }
    }

    return { skipped: false, id: data?.id }
  } catch (error) {
    console.error('[email] send exception:', {
      subject: input.subject,
      message: error instanceof Error ? error.message : 'unknown',
    })
    return { skipped: false, error: error instanceof Error ? error.message : 'unknown' }
  }
}
