import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ContactSchema = z.object({
  name: z.string().trim().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  email: z
    .string()
    .trim()
    .min(1, 'メールアドレスを入力してください')
    .max(254, 'メールアドレスが長すぎます')
    .email('有効なメールアドレスを入力してください'),
  subject: z.string().trim().min(1, '件名を入力してください').max(100, '件名は100文字以内で入力してください'),
  message: z
    .string()
    .trim()
    .min(10, '本文は10文字以上で入力してください')
    .max(2000, '本文は2000文字以内で入力してください'),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
})

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_ENTRIES = 1000
const rateLimitStore = new Map<string, number>()

const DISCORD_EMBED_COLOR = 0x5865f2

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()

  if (rateLimitStore.size > RATE_LIMIT_MAX_ENTRIES) {
    for (const [key, ts] of rateLimitStore) {
      if (now - ts > RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(key)
    }
  }

  const last = rateLimitStore.get(ip)
  if (last !== undefined && now - last < RATE_LIMIT_WINDOW_MS) return true
  rateLimitStore.set(ip, now)
  return false
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return process.env.NODE_ENV !== 'production'

  const params = new URLSearchParams({ secret, response: token, remoteip: ip })

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: params,
    })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}

interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  ip: string
}

function buildDiscordPayload({ name, email, subject, message, ip }: ContactPayload) {
  return {
    username: 'Portfolio Contact',
    embeds: [
      {
        title: `[Portfolio] ${subject}`.slice(0, 256),
        color: DISCORD_EMBED_COLOR,
        timestamp: new Date().toISOString(),
        fields: [
          { name: 'Name', value: name.slice(0, 1024), inline: true },
          { name: 'Email', value: email.slice(0, 1024), inline: true },
          { name: 'IP', value: ip.slice(0, 1024), inline: true },
          { name: 'Message', value: message.slice(0, 1024) },
        ],
      },
    ],
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: '送信間隔が短すぎます。1分ほど時間をおいてから再度お試しください。' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'リクエストの形式が正しくありません。' }, { status: 400 })
  }

  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: '入力内容に誤りがあります。',
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const { name, email, subject, message, website, turnstileToken } = parsed.data

  if (website && website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  const turnstileEnabled = Boolean(process.env.TURNSTILE_SECRET_KEY)
  if (turnstileEnabled) {
    if (!turnstileToken) {
      return NextResponse.json({ error: 'スパム認証が完了していません。' }, { status: 400 })
    }
    const valid = await verifyTurnstile(turnstileToken, ip)
    if (!valid) {
      return NextResponse.json({ error: 'スパム認証に失敗しました。再度お試しください。' }, { status: 400 })
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

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildDiscordPayload({ name, email, subject, message, ip })),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('Discord webhook error:', res.status, detail)
      return NextResponse.json(
        { error: '送信に失敗しました。時間をおいて再度お試しください。' },
        { status: 502 },
      )
    }
  } catch (err) {
    console.error('Discord webhook request failed:', err)
    return NextResponse.json(
      { error: '送信に失敗しました。時間をおいて再度お試しください。' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
