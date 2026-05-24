import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// 外部APIからSpotifyデータを取得する関数
async function fetchSpotifyData() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト
    
    const url = new URL('https://xs492099.xsrv.jp/status.json')
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
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // テキストとして取得してからJSONをパース
    const text = await response.text()
    let data
    try {
      const cleanedText = text.trim()
      
      // 2つのJSONオブジェクトが連結されている場合を処理
      // パターン: {...}  {...} または {...}  "key": {...}
      // 最初の閉じ括弧の位置を探す
      let braceCount = 0
      let firstObjectEnd = -1
      
      for (let i = 0; i < cleanedText.length; i++) {
        if (cleanedText[i] === '{') braceCount++
        if (cleanedText[i] === '}') {
          braceCount--
          if (braceCount === 0) {
            firstObjectEnd = i
            break
          }
        }
      }
      
      if (firstObjectEnd !== -1) {
        // 最初のオブジェクトをパース
        const firstObject = JSON.parse(cleanedText.substring(0, firstObjectEnd + 1))
        
        // 残りの部分を処理（"spotify": {...} または "discord": {...} の形式）
        const remaining = cleanedText.substring(firstObjectEnd + 1).trim()
        
        // "spotify" または "discord" キーを処理
        if (remaining.startsWith('"spotify"') || remaining.startsWith('"discord"')) {
          // "spotify": {...} または "discord": {...} の形式を処理
          const colonIndex = remaining.indexOf(':')
          if (colonIndex !== -1) {
            const keyName = remaining.substring(1, colonIndex - 1) // "spotify" または "discord"
            const afterColon = remaining.substring(colonIndex + 1).trim()
            if (afterColon.startsWith('{')) {
              // 括弧のバランスを数えて正確なオブジェクトの終わりを見つける
              let braceCount = 0
              let objectEnd = -1

              for (let i = 0; i < afterColon.length; i++) {
                if (afterColon[i] === '{') braceCount++
                if (afterColon[i] === '}') {
                  braceCount--
                  if (braceCount === 0) {
                    objectEnd = i
                    break
                  }
                }
              }

              if (objectEnd !== -1) {
                const nestedObject = JSON.parse(afterColon.substring(0, objectEnd + 1))
                // 2つのオブジェクトを結合
                data = {
                  ...firstObject,
                  [keyName]: nestedObject
                }
              } else {
                // ネストされたオブジェクトが見つからない場合は最初のオブジェクトのみ
                data = firstObject
              }
            } else {
              data = firstObject
            }
          } else {
            data = firstObject
          }
        } else if (remaining.trim()) {
          // 残りの部分が別のJSONオブジェクトの場合
          const secondObjectMatch = remaining.match(/\{[\s\S]*\}/)
          if (secondObjectMatch) {
            const secondObject = JSON.parse(secondObjectMatch[0])
            // 2つのオブジェクトを結合
            data = {
              ...firstObject,
              ...secondObject
            }
          } else {
            data = firstObject
          }
        } else {
          data = firstObject
        }
      } else {
        // 通常のJSONとしてパース
        data = JSON.parse(cleanedText)
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response text (first 600 chars):', text.substring(0, 600))
      throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
    
    return data
  } catch (error) {
    console.error('Error fetching Spotify data:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  // SSEストリームを作成
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let lastSpotifyData: string | null = null
      let lastDiscordStatus: string | null = null
      let lastDiscordActivities: string | null = null

      // 初回データを取得
      try {
        const data = await fetchSpotifyData()
        lastSpotifyData = data?.spotify ? JSON.stringify(data.spotify) : null
        lastDiscordStatus = data?.discord?.status ?? null
        lastDiscordActivities = JSON.stringify(data?.discord?.activities ?? [])

        // 初回データを送信
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      } catch {
        const errorMessage = `data: ${JSON.stringify({ error: 'Failed to fetch initial data' })}\n\n`
        controller.enqueue(encoder.encode(errorMessage))
      }
      
      // 定期的にチェック（5秒ごと）
      const checkInterval = setInterval(async () => {
        try {
          const data = await fetchSpotifyData()
          const currentSpotifyData = data?.spotify ? JSON.stringify(data.spotify) : null
          const currentDiscordStatus = data?.discord?.status ?? null
          const currentDiscordActivities = JSON.stringify(data?.discord?.activities ?? [])

          const spotifyChanged = currentSpotifyData !== lastSpotifyData
          const discordChanged = currentDiscordStatus !== lastDiscordStatus
          const discordActivitiesChanged = currentDiscordActivities !== lastDiscordActivities

          if (spotifyChanged || discordChanged || discordActivitiesChanged) {
            lastSpotifyData = currentSpotifyData
            lastDiscordStatus = currentDiscordStatus
            lastDiscordActivities = currentDiscordActivities
            const message = `data: ${JSON.stringify(data)}\n\n`
            controller.enqueue(encoder.encode(message))
          }
        } catch {
          console.error('Error in SSE interval')
          // エラー時は再接続を促すためにエラーメッセージを送信
          const errorMessage = `data: ${JSON.stringify({ error: 'Failed to fetch data' })}\n\n`
          controller.enqueue(encoder.encode(errorMessage))
        }
      }, 5000) // 5秒ごとにチェック
      
      // クライアントが切断したときのクリーンアップ
      request.signal.addEventListener('abort', () => {
        clearInterval(checkInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
