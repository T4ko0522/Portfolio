import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_URL = 'https://xs492099.xsrv.jp/status.json'
const FETCH_TIMEOUT_MS = 10_000

// 上流 API が 2 つの JSON オブジェクトを連結して返すことがあるため、手動で分割してマージする
function parseUpstreamPayload(text: string): unknown {
  const cleaned = text.trim()
  let braceCount = 0
  let firstObjectEnd = -1

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++
    if (cleaned[i] === '}') {
      braceCount--
      if (braceCount === 0) {
        firstObjectEnd = i
        break
      }
    }
  }

  if (firstObjectEnd === -1) {
    return JSON.parse(cleaned)
  }

  const firstObject = JSON.parse(cleaned.substring(0, firstObjectEnd + 1)) as Record<string, unknown>
  const remaining = cleaned.substring(firstObjectEnd + 1).trim()

  if (!remaining) return firstObject

  if (remaining.startsWith('"spotify"') || remaining.startsWith('"discord"')) {
    const colonIndex = remaining.indexOf(':')
    if (colonIndex === -1) return firstObject

    const keyName = remaining.substring(1, colonIndex - 1)
    const afterColon = remaining.substring(colonIndex + 1).trim()
    if (!afterColon.startsWith('{')) return firstObject

    let nestedBraceCount = 0
    let objectEnd = -1
    for (let i = 0; i < afterColon.length; i++) {
      if (afterColon[i] === '{') nestedBraceCount++
      if (afterColon[i] === '}') {
        nestedBraceCount--
        if (nestedBraceCount === 0) {
          objectEnd = i
          break
        }
      }
    }
    if (objectEnd === -1) return firstObject

    const nestedObject = JSON.parse(afterColon.substring(0, objectEnd + 1))
    return { ...firstObject, [keyName]: nestedObject }
  }

  const secondObjectMatch = remaining.match(/\{[\s\S]*\}/)
  if (secondObjectMatch) {
    const secondObject = JSON.parse(secondObjectMatch[0]) as Record<string, unknown>
    return { ...firstObject, ...secondObject }
  }

  return firstObject
}

async function fetchSpotifyDataDirect(): Promise<unknown> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const url = new URL(SOURCE_URL)
    url.searchParams.set('_t', String(Date.now()))
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const text = await response.text()
    return parseUpstreamPayload(text)
  } finally {
    clearTimeout(timeoutId)
  }
}

async function getDurableObjectStub() {
  try {
    const cf = await getCloudflareContext({ async: true })
    const binding = cf.env?.SPOTIFY_STATUS_DO
    if (!binding) return null
    const id = binding.idFromName('global')
    return binding.get(id)
  } catch {
    return null
  }
}

export async function GET(_request: NextRequest) {
  const stub = await getDurableObjectStub()

  // 本番 (Cloudflare Workers) は DO が単一の状態キャッシュを保持する。
  // ローカル `pnpm dev` では binding が無いため上流 fetch にフォールバックする。
  if (stub) {
    try {
      const doResponse = await stub.fetch('https://do.internal/state')
      if (!doResponse.ok) {
        throw new Error(`DO returned ${doResponse.status}`)
      }
      const body = await doResponse.text()
      return new NextResponse(body, {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      })
    } catch (error) {
      console.error('SpotifyStatusDO proxy failed, falling back to upstream:', error)
    }
  }

  try {
    const data = await fetchSpotifyDataDirect()
    return NextResponse.json(data, {
      headers: { 'cache-control': 'no-store' },
    })
  } catch (error) {
    console.error('Error fetching Spotify data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 502 })
  }
}
