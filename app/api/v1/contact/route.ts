import { NextResponse } from 'next/server'
import { contactSchema, type ContactInput } from '../../../../lib/contact-schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const REQUEST_TIMEOUT_MS = 10_000
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 5
const RATE_LIMIT_MAX_ENTRIES = 1_000
const DISCORD_EMBED_COLOR = 0x5865f2
const DISCORD_TITLE_MAX_LENGTH = 256
const DISCORD_FIELD_MAX_LENGTH = 1_024

type ContactMessage = Pick<ContactInput, 'name' | 'email' | 'subject' | 'message'> & {
  ip: string
}

const rateLimitStore = new Map<string, number[]>()

function getClientIp(request: Request): string {
  const cloudflareIp = request.headers.get('cf-connecting-ip')?.trim()
  const forwardedIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')?.trim()

  return cloudflareIp || forwardedIp || realIp || 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()

  for (const [key, timestamps] of rateLimitStore) {
    const recentTimestamps = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)
    if (recentTimestamps.length === 0) {
      rateLimitStore.delete(key)
    } else {
      rateLimitStore.set(key, recentTimestamps)
    }
  }

  const recentRequests = rateLimitStore.get(ip) ?? []
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) return true

  rateLimitStore.set(ip, [...recentRequests, now])

  if (rateLimitStore.size > RATE_LIMIT_MAX_ENTRIES) {
    const oldestIp = rateLimitStore.keys().next().value
    if (oldestIp) rateLimitStore.delete(oldestIp)
  }

  return false
}

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) return false

    const data = (await response.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

function buildDiscordPayload({ name, email, subject, message, ip }: ContactMessage) {
  return {
    username: 'Portfolio Contact',
    embeds: [
      {
        title: `[Portfolio] ${subject}`.slice(0, DISCORD_TITLE_MAX_LENGTH),
        color: DISCORD_EMBED_COLOR,
        timestamp: new Date().toISOString(),
        fields: [
          { name: 'Name', value: name.slice(0, DISCORD_FIELD_MAX_LENGTH), inline: true },
          { name: 'Email', value: email.slice(0, DISCORD_FIELD_MAX_LENGTH), inline: true },
          { name: 'IP', value: ip.slice(0, DISCORD_FIELD_MAX_LENGTH), inline: true },
          { name: 'Message', value: message.slice(0, DISCORD_FIELD_MAX_LENGTH) },
        ],
      },
    ],
  }
}

async function sendToDiscord(webhookUrl: string, payload: ReturnType<typeof buildDiscordPayload>) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (response.ok) return

  const detail = await response.text().catch(() => '')
  throw new Error(`Discord webhook responded with ${response.status}: ${detail}`)
}

export async function POST(request: Request) {
  const ip = getClientIp(request)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません。' }, { status: 400 })
  }

  const result = contactSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      {
        error: '入力内容に誤りがあります。',
        issues: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const { website, turnstileToken, ...contact } = result.data

  if (website?.trim()) return NextResponse.json({ ok: true })

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY
  if (turnstileSecret) {
    if (!turnstileToken) {
      return NextResponse.json({ error: 'スパム認証が完了していません。' }, { status: 400 })
    }

    const verified = await verifyTurnstile(turnstileToken, ip, turnstileSecret)
    if (!verified) {
      return NextResponse.json(
        { error: 'スパム認証に失敗しました。再度お試しください。' },
        { status: 400 },
      )
    }
  }

  const webhookUrl = process.env.CONTACT_DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    console.error('CONTACT_DISCORD_WEBHOOK_URL is not configured')
    return NextResponse.json(
      { error: 'お問い合わせ送信機能が設定されていません。' },
      { status: 503 },
    )
  }

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: '1分以内の送信回数が上限に達しました。時間をおいてから再度お試しください。' },
      { status: 429 },
    )
  }

  try {
    await sendToDiscord(webhookUrl, buildDiscordPayload({ ...contact, ip }))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Discord webhook request failed:', error)
    return NextResponse.json(
      { error: '送信に失敗しました。時間をおいて再度お試しください。' },
      { status: 502 },
    )
  }
}
