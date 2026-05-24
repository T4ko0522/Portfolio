import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_URL = 'https://xs492099.xsrv.jp/status.json'
const FETCH_TIMEOUT_MS = 10_000
const CACHE_TTL_SECONDS = 5

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

async function fetchSpotifyData(): Promise<unknown> {
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
    try {
      return parseUpstreamPayload(text)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response text (first 600 chars):', text.substring(0, 600))
      throw new Error(
        `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      )
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

type CloudflareCache = {
  match: (key: Request) => Promise<Response | undefined>
  put: (key: Request, value: Response) => Promise<void>
}

type CloudflareCaches = { default?: CloudflareCache }

async function getEdgeCache(): Promise<{
  cache: CloudflareCache | undefined
  waitUntil: ((promise: Promise<unknown>) => void) | undefined
}> {
  try {
    const cf = await getCloudflareContext({ async: true })
    const caches = (globalThis as unknown as { caches?: CloudflareCaches }).caches
    return {
      cache: caches?.default,
      waitUntil: cf.ctx?.waitUntil?.bind(cf.ctx),
    }
  } catch {
    return { cache: undefined, waitUntil: undefined }
  }
}

function buildCacheKey(request: NextRequest): Request {
  const url = new URL(request.url)
  return new Request(`${url.origin}${url.pathname}`, { method: 'GET' })
}

export async function GET(request: NextRequest) {
  const cacheKey = buildCacheKey(request)
  const { cache, waitUntil } = await getEdgeCache()

  if (cache) {
    const cached = await cache.match(cacheKey)
    if (cached) return cached
  }

  try {
    const data = await fetchSpotifyData()
    const response = NextResponse.json(data, {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL_SECONDS}`,
      },
    })

    if (cache) {
      const putPromise = cache.put(cacheKey, response.clone())
      if (waitUntil) {
        waitUntil(putPromise)
      } else {
        await putPromise
      }
    }

    return response
  } catch (error) {
    console.error('Error fetching Spotify data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 502 })
  }
}
