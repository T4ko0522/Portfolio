"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(10) // 初期値を10%に設定
  const [loadingText, setLoadingText] = useState("Initializing...")
  const [startTime, setStartTime] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  // ロード画面の開始時間を記録
  useEffect(() => {
    setStartTime(Date.now())
  }, [])

  // プログレスバーのアニメーション - 4秒かけて進行
  useEffect(() => {
    if (isExiting) return // 終了中は進行を停止

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime

      // 4000ms（4秒）で100%になるように調整
      if (elapsedTime < 4000) {
        // 経過時間に基づいて進行状況を計算（10%から始めて100%まで）
        const newProgress = 10 + Math.min(90, (elapsedTime / 4000) * 90)
        setProgress(Math.round(newProgress))
      } else {
        // 4秒経過したら100%にして完了
        setProgress(100)
        clearInterval(interval)
        handleComplete()
      }
    }, 50) // 更新頻度は50msごと

    // クリーンアップ関数でインターバルをクリア
    return () => clearInterval(interval)
  }, [startTime, isExiting])

  // ローディングテキストのアニメーション - テキスト変更の間隔を長く
  useEffect(() => {
    if (isExiting) return // 終了中はテキスト変更を停止

    const texts = ["Initializing...", "Loading assets...", "Almost there..."]

    let currentIndex = 0
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % texts.length
      setLoadingText(texts[currentIndex])
    }, 1000) // テキスト変更を1秒ごとに

    return () => clearInterval(interval)
  }, [isExiting])

  // 完了処理を一元化
  const handleComplete = () => {
    if (isExiting) return // 既に終了処理中なら何もしない

    setIsExiting(true)

    // 少し遅延を入れて、アニメーションが完了するのを待つ
    setTimeout(() => {
      onLoadingComplete()
    }, 300)
  }

  // スキップボタンを追加
  const handleSkip = () => {
    setProgress(100)
    handleComplete()
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      onAnimationComplete={(definition) => {
        if (definition === "exit" && isExiting) {
          // exit アニメーションが完了したら確実にコールバックを呼び出す
          onLoadingComplete()
        }
      }}
    >
      {/* ロゴ */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome to My Portfolio...
        </div>
      </motion.div>

      {/* ローディングアニメーション */}
      <div className="relative mb-8">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-16 h-16 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500"
        />
        <motion.div
          animate={{
            rotate: -180,
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-pink-500 border-l-pink-500 opacity-70"
        />
      </div>

      {/* ローディングテキスト */}
      <motion.div
        key={loadingText}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-purple-300 mb-6 h-6 text-center"
      >
        {loadingText}
      </motion.div>

      {/* プログレスバー */}
      <div className="w-64 md:w-80 bg-gray-800 rounded-full h-2.5 mb-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: "10%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* パーセント表示 */}
      <div className="text-gray-400 text-sm">{progress}%</div>

      {/* ヒント */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-20 left-0 right-0 text-center text-gray-500 text-xs px-4"
      >
        <p className="mb-1">HINT! : This loading screen is for coolness and doesn't mean much (lol).
          <br />
          If you want to skip it, just click the button below.
        </p>
      </motion.div>

      {/* 背景パーティクル */}
      <div className="fixed inset-0 -z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-500 opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* スキップボタン */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-8 left-0 right-0 text-center px-4"
      >
        <button
          onClick={handleSkip}
          className="px-4 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
        >
          Skip Loading
        </button>
      </motion.div>
    </motion.div>
  )
}
