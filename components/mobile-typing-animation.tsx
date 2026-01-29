"use client"

import { useEffect, useState, useRef } from "react"

interface MobileTypingAnimationProps {
  texts: string[]
  className?: string
}

export default function MobileTypingAnimation({ texts, className = "" }: MobileTypingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [width, setWidth] = useState(0)
  const measureRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const typingDuration = 800 // タイピングアニメーションの時間（ミリ秒）
    const deletingDuration = 400 // 削除アニメーションの時間（ミリ秒）
    const pauseTime = 2000 // テキスト表示完了後の待機時間（ミリ秒）

    // テキストの実際の幅を測定（containerの制限なし）
    const measureWidth = () => {
      if (!measureRef.current) return 0
      // 測定用の非表示span要素から直接幅を取得
      return measureRef.current.getBoundingClientRect().width
    }

    const targetWidth = measureWidth()

    if (!isDeleting) {
      // タイピングアニメーション
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / typingDuration, 1)

        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setWidth(targetWidth * easeOut)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // タイピング完了、少し待ってから削除開始
          setTimeout(() => setIsDeleting(true), pauseTime)
        }
      }

      requestAnimationFrame(animate)
    } else {
      // 削除アニメーション
      const startTime = Date.now()
      const startWidth = targetWidth

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / deletingDuration, 1)

        // イージング関数（ease-in）
        const easeIn = Math.pow(progress, 3)
        setWidth(startWidth * (1 - easeIn))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // 削除完了、次のテキストへ
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % texts.length)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [currentIndex, isDeleting, texts])

  return (
    <div className={`flex items-center justify-center gap-x-1.5 sm:gap-x-2 w-full py-2 sm:py-4 ${className}`}>
      <div className="flex items-center gap-x-1.5 sm:gap-x-2 leading-normal" style={{ lineHeight: '1.9' }}>
        <span className="text-white flex-shrink-0 text-base sm:text-lg">I am a</span>
        <span className="text-white flex items-center" style={{ minHeight: '1.9em' }}>
          {/* 表示領域（widthでアニメーション） */}
          <span
            className="inline-block overflow-hidden whitespace-nowrap"
            style={{ width: `${width}px`, lineHeight: '1.9' }}
          >
            <span className="inline-block whitespace-nowrap">
              {texts[currentIndex]}
            </span>
          </span>
          {/* カーソル（overflow の外に配置） */}
          <span className="inline-block w-0.5 sm:w-1 bg-white ml-1 sm:ml-2 animate-blink flex-shrink-0"
          style={{ height: '1em' }}
          />
        </span>
      </div>
      {/* 幅測定用の非表示要素 */}
      <span
        ref={measureRef}
        className="text-white absolute opacity-0 pointer-events-none whitespace-nowrap"
        aria-hidden="true"
        style={{ lineHeight: '1.9' }}
      >
        {texts[currentIndex]}
      </span>
    </div>
  )
}
