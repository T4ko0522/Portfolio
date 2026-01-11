import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒でタイムアウト
    
    const response = await fetch('https://xs492099.xsrv.jp/status.json', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=10',
      },
    })
  } catch (error) {
    console.error('Error fetching Spotify data:', error)
    
    // エラーの詳細を返す（開発環境のみ）
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Spotify data',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
}
