"use client"

import { useEffect, useState, useRef } from "react"

interface TypingAnimationProps {
  texts: string[]
  className?: string
}

export default function TypingAnimation({ texts, className = "" }: TypingAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [width, setWidth] = useState(0)
  const textRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const currentText = texts[currentIndex]
    const typingDuration = 800 // タイピングアニメーションの時間（ミリ秒）
    const deletingDuration = 400 // 削除アニメーションの時間（ミリ秒）
    const pauseTime = 2000 // テキスト表示完了後の待機時間（ミリ秒）

    // テキストの実際の幅を測定
    const measureWidth = () => {
      if (!textRef.current) return 0
      const span = document.createElement('span')
      span.style.visibility = 'hidden'
      span.style.position = 'absolute'
      span.style.whiteSpace = 'nowrap'
      span.className = textRef.current.className
      span.textContent = currentText
      document.body.appendChild(span)
      const measuredWidth = span.getBoundingClientRect().width
      document.body.removeChild(span)
      return measuredWidth
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
    <div className={`inline-flex items-center gap-x-2 ${className}`}>
      <span className="text-white flex-shrink-0">I am a</span>
      <span className="text-white inline-flex items-center relative">
        <span
          className="inline-block overflow-hidden whitespace-nowrap"
          style={{ width: `${width}px` }}
        >
          <span ref={textRef} className="inline-block whitespace-nowrap">
            {texts[currentIndex]}
          </span>
        </span>
        <span className="inline-block w-0.5 h-4 bg-white ml-1 animate-blink" />
      </span>
    </div>
  )
}
