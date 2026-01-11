"use client"

import { ReactNode, useEffect, useState } from "react"

interface StaggeredCurtainRevealProps {
  isVisible: boolean
  children: ReactNode
  stripCount?: number
  staggerDelay?: number
  duration?: number
}

export default function StaggeredCurtainReveal({
  isVisible,
  children,
  stripCount = 4,
  staggerDelay = 0.1,
  duration = 1.0,
}: StaggeredCurtainRevealProps) {
  const [shouldRender, setShouldRender] = useState(isVisible)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
      setIsAnimating(false)
    } else if (shouldRender && !isAnimating) {
      // アニメーション開始
      setIsAnimating(true)
      
      // アニメーション完了後に非表示
      const totalDuration = (stripCount * staggerDelay + duration) * 1000
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsAnimating(false)
      }, totalDuration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, shouldRender, isAnimating, stripCount, staggerDelay, duration])

  if (!shouldRender) {
    return null
  }

  return (
    <div className={`fixed inset-0 z-[9999] overflow-hidden ${isAnimating ? 'pointer-events-none bg-transparent' : 'bg-black'}`}>
      {/* コンテンツ（アニメーション中は非表示） */}
      {!isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
      
      {/* Staggered Curtain Reveal - 4分割、右から左に */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: stripCount }).map((_, i) => {
          // 右から左にアニメーションするため、インデックスを逆順にする
          const reverseIndex = stripCount - 1 - i
          const delay = reverseIndex * staggerDelay
          const animationDuration = `${duration}s`
          const animationDelay = `${delay}s`
          
          return (
            <div
              key={i}
              className="flex-1 bg-black"
              style={{
                animation: isAnimating
                  ? `curtainReveal ${animationDuration} cubic-bezier(0.25, 0.46, 0.45, 0.94) ${animationDelay} forwards`
                  : "none",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
