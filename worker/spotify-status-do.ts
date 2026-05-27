import { DurableObject } from 'cloudflare:workers'

const UPSTREAM_URL = 'https://xs492099.xsrv.jp/status.json'
const UPSTREAM_TIMEOUT_MS = 10_000
const REFRESH_INTERVAL_MS = 5_000
const WS_TAG = 'spotify-status'

type StoredState = {
  data: unknown
  hash: string
  updatedAt: number
}

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

async function sha256Hex(text: string): Promise<string> {
  const buffer = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  const bytes = new Uint8Array(digest)
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0')
  }
  return out
}

export class SpotifyStatusDO extends DurableObject<CloudflareEnv> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/ws') {
      return this.handleWebSocketUpgrade(request)
    }

    if (url.pathname === '/state') {
      const data = await this.getStateRefreshIfStale()
      return new Response(JSON.stringify(data), {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      })
    }

    return new Response('Not Found', { status: 404 })
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    if (request.headers.get('upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 })
    }

    const pair = new WebSocketPair()
    const client = pair[0]
    const server = pair[1]

    this.ctx.acceptWebSocket(server, [WS_TAG])

    const stored = await this.ctx.storage.get<StoredState>('state')
    if (stored) {
      try {
        server.send(JSON.stringify(stored.data))
      } catch {
        // ignore initial-send failures; alarm will retry
      }
    }

    const existingAlarm = await this.ctx.storage.getAlarm()
    if (existingAlarm === null) {
      await this.ctx.storage.setAlarm(Date.now() + REFRESH_INTERVAL_MS)
      // 初回接続時は state が古い/未取得の可能性が高いので即座に上流を引きにいく
      if (!stored || Date.now() - stored.updatedAt > REFRESH_INTERVAL_MS) {
        await this.refreshAndBroadcast()
      }
    }

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(_ws: WebSocket, _message: string | ArrayBuffer): Promise<void> {
    // クライアントは受信のみを想定しているため、メッセージは破棄する
  }

  async webSocketClose(
    _ws: WebSocket,
    _code: number,
    _reason: string,
    _wasClean: boolean,
  ): Promise<void> {
    await this.cleanupIfNoSockets()
  }

  async webSocketError(_ws: WebSocket, _error: unknown): Promise<void> {
    await this.cleanupIfNoSockets()
  }

  async alarm(): Promise<void> {
    const sockets = this.ctx.getWebSockets(WS_TAG)
    if (sockets.length === 0) {
      // 誰も繋いでいない間は alarm を止める (再接続時に再設定される)
      return
    }

    await this.refreshAndBroadcast()
    await this.ctx.storage.setAlarm(Date.now() + REFRESH_INTERVAL_MS)
  }

  private async cleanupIfNoSockets(): Promise<void> {
    const sockets = this.ctx.getWebSockets(WS_TAG)
    if (sockets.length === 0) {
      await this.ctx.storage.deleteAlarm()
    }
  }

  private async refreshAndBroadcast(): Promise<void> {
    let data: unknown
    try {
      data = await this.fetchUpstream()
    } catch (error) {
      console.error('SpotifyStatusDO upstream fetch failed:', error)
      return
    }

    const serialized = JSON.stringify(data)
    const hash = await sha256Hex(serialized)
    const prev = await this.ctx.storage.get<StoredState>('state')

    await this.ctx.storage.put<StoredState>('state', {
      data,
      hash,
      updatedAt: Date.now(),
    })

    if (prev?.hash === hash) {
      return
    }

    const sockets = this.ctx.getWebSockets(WS_TAG)
    for (const ws of sockets) {
      try {
        ws.send(serialized)
      } catch {
        // 個別の送信失敗は無視する (close ハンドラ側で掃除される)
      }
    }
  }

  private async getStateRefreshIfStale(): Promise<unknown> {
    const stored = await this.ctx.storage.get<StoredState>('state')
    const stale = !stored || Date.now() - stored.updatedAt > REFRESH_INTERVAL_MS

    if (!stale && stored) {
      return stored.data
    }

    try {
      const data = await this.fetchUpstream()
      const serialized = JSON.stringify(data)
      const hash = await sha256Hex(serialized)
      await this.ctx.storage.put<StoredState>('state', {
        data,
        hash,
        updatedAt: Date.now(),
      })
      return data
    } catch (error) {
      if (stored) return stored.data
      throw error
    }
  }

  private async fetchUpstream(): Promise<unknown> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS)

    try {
      const url = new URL(UPSTREAM_URL)
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
        throw new Error(`Upstream HTTP ${response.status}`)
      }

      const text = await response.text()
      return parseUpstreamPayload(text)
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
