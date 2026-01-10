"use client"

import { useEffect, useState } from "react"

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      // 最初のセクション（メインコンテンツ）の高さ分のスクロール進捗を計算
      // 0から1の範囲で正規化
      const maxScroll = windowHeight // 1画面分のスクロールで完了
      const progress = Math.min(scrollTop / maxScroll, 1)
      
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // 初期値を設定

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return scrollProgress
}
