"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import { motion, AnimatePresence } from "framer-motion"
import {
  Github,
  Twitter,
  ExternalLink,
  Code,
  Trophy,
  User,
  ImageIcon,
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  Gift,
  Cake,
  Youtube,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"
import LoadingScreen from "../components/loading-screen"
import VRChatGallery from "../components/vrchat-gallery"
import { landscapePhotos, portraitPhotos } from "../components/vrchat-gallery"
import TypewriterComponent from "typewriter-effect"
import Image from "next/image"

// 年齢計算関数
function calculateAge(birthMonth: number, birthDay: number): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  const birthDate = new Date(currentYear, birthMonth - 1, birthDay)

  // 今年の誕生日がまだ来ていない場合は1歳引く
  if (today < birthDate) {
    return currentYear - 2008 - 1
  }

  return currentYear - 2008
}

// 次の誕生日までの日数を計算
function getDaysUntilBirthday(birthMonth: number, birthDay: number): number {
  const today = new Date()
  const currentYear = today.getFullYear()
  let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay)

  // 今年の誕生日が過ぎている場合は来年の誕生日を計算
  if (today > nextBirthday) {
    nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay)
  }

  // 日数の差を計算
  const diffTime = nextBirthday.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [age, setAge] = useState<number>(0)
  const [daysUntilBirthday, setDaysUntilBirthday] = useState<number>(0)

  // 誕生日の設定（5月22日）
  const birthMonth = 5
  const birthDay = 22

  // クライアントサイドレンダリングのためのマウント確認と年齢・カウントダウン計算
  useEffect(() => {
    setMounted(true)
    setAge(calculateAge(birthMonth, birthDay))
    setDaysUntilBirthday(getDaysUntilBirthday(birthMonth, birthDay))

    // 毎日0時に年齢とカウントダウンを更新
    const updateAgeAndCountdown = () => {
      setAge(calculateAge(birthMonth, birthDay))
      setDaysUntilBirthday(getDaysUntilBirthday(birthMonth, birthDay))
    }

    // 次の0時までの時間を計算
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    // 0時にタイマーをセット
    const midnightTimer = setTimeout(() => {
      updateAgeAndCountdown()
      // その後は24時間ごとに更新
      setInterval(updateAgeAndCountdown, 24 * 60 * 60 * 1000)
    }, timeUntilMidnight)

    return () => {
      clearTimeout(midnightTimer)
    }
  }, [])

  // ローディング完了ハンドラー
  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  if (!mounted) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  }

  const techStack = [
    { name: "JavaScript", color: "bg-yellow-500", textColor: "text-black" },
    { name: "TypeScript", color: "bg-blue-600", textColor: "text-white" },
    { name: "Python", color: "bg-yellow-400", textColor: "text-black" },
    { name: "React", color: "bg-cyan-400", textColor: "text-black" },
    { name: "Next.js", color: "bg-black", textColor: "text-white" },
    { name: "Node.js", color: "bg-green-600", textColor: "text-white" },
    { name: "Google Cloud", color: "bg-blue-500", textColor: "text-white" },
    { name: "Docker", color: "bg-blue-600", textColor: "text-white" },
    { name: "Git", color: "bg-orange-600", textColor: "text-white" },
    { name: "Vercel", color: "bg-black", textColor: "text-white" },
    { name: "PostgreSQL", color: "bg-blue-700", textColor: "text-white" },
    { name: "Prettier", color: "bg-pink-500", textColor: "text-white" },
  ]

  // 学習中、学習予定のスキル
  const learningSkills = [
    { name: "Kubernetes", status: "learning" },
    { name: "Rust", status: "planned" },
    { name: "Microsoft Azure", status: "planned" },
    { name: "C#", status: "planned" },
    { name: "Network", status: "planned" },
    { name: "Security", status: "planned" },
  ]

  // 自己紹介テキストの配列 - VRChatterを最初に表示
  const introTexts = [
    "VRChatter.",
    "Full Stack Engineer.",
    "Infrastructure Engineer.",
    "Open Source Contributor.",
    "Game Nerd 🤓",
  ]

  // 配列をシャッフルする関数
  const shuffleArray = (array: string[]) => {
    // 最初の要素を保持し、残りをシャッフル
    const firstElement = array[0]
    const restElements = array.slice(1)

    // Fisher-Yates
    for (let i = restElements.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[restElements[i], restElements[j]] = [restElements[j], restElements[i]]
    }

    // 最初の要素を先頭に戻し、シャッフルされた残りの要素と結合
    return [firstElement, ...restElements]
  }

  // 最初の要素を保持し、残りをシャッフルした自己紹介テキスト
  const orderedIntroTexts = shuffleArray(introTexts)

  const achievements = [
    { title: "Fortnite Asia", rank: "#9, #27" },
    { title: "Overwatch2", rank: "Master3" },
    { title: "VALORANT", rank: "Immortal 1" },
  ]

  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="/images/icon.png"
        />
        {([...landscapePhotos, ...portraitPhotos]).map((photo) => (
          <link
            key={photo.imageUrl}
            rel="prefetch"
            as="image"
          />
        ))}
      </Head>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" onLoadingComplete={handleLoadingComplete} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white"
          >
            <div className="container mx-auto px-4 py-16 max-w-4xl">
              {/* ヘッダー */}
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="text-center mb-16"
              >
                {/* アイコンにホバーエフェクトを追加 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                  className="w-32 h-32 mx-auto mb-6 relative group cursor-pointer"
                >
                  {/* 背景の光るエフェクト */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-md z-0"
                    initial={{ scale: 0.8 }}
                    whileHover={{
                      scale: 1.2,
                      rotate: 10,
                      transition: { duration: 0.3 },
                    }}
                  />

                  {/* 回転する枠線 */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 border-b-purple-300 border-l-pink-300 z-10"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    style={{ opacity: 0.6 }}
                  />

                  {/* アイコン本体 */}
                  <motion.div
                    className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg shadow-purple-500/20 relative z-20"
                    whileHover={{
                      scale: 1.1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                      },
                    }}
                  >
                    <div className="relative w-full h-full">
                      <Image src="/images/icon.png" alt="Tako" fill sizes="128px" className="object-cover" priority />
                    </div>

                    {/* ホバー時のオーバーレイ */}
                    <motion.div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="text-white text-xs font-medium">Tako</span>
                    </motion.div>
                  </motion.div>

                  {/* ピクセルエフェクト（ドット） */}
                  <div className="absolute -inset-4 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1.5 h-1.5 rounded-full bg-purple-400"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          y: [0, -10, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
                >
                  👋 Hello! I&apos;m Tako.
                </motion.h1>

                {/* タイピングアニメーション */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl md:text-2xl text-purple-300 mb-4 h-8 flex justify-center items-center"
                >
                  <span className="mr-2">I am</span>
                  <TypewriterComponent
                    options={{
                      strings: orderedIntroTexts,
                      autoStart: true,
                      loop: true,
                      deleteSpeed: 50,
                      delay: 80,
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center space-x-4"
                >
                  <a
                    href="https://github.com/T4ko0522"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-6 h-6" />
                  </a>
                  <a
                    href="https://x.com/Tako_0522"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.youtube.com/@%E3%82%BF%E3%82%B3%E3%81%95%E3%82%93%E3%81%A7%E3%81%99"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-6 h-6" />
                  </a>
                </motion.div>
              </motion.div>

              {/* タブコンテンツ */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger
                    value="about"
                    className="data-[state=active]:bg-purple-600 hover:bg-purple-500/20 transition-colors duration-200 relative overflow-hidden group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top

                      // クリック時の波紋エフェクト
                      const ripple = document.createElement("span")
                      ripple.style.position = "absolute"
                      ripple.style.width = "5px"
                      ripple.style.height = "5px"
                      ripple.style.borderRadius = "50%"
                      ripple.style.backgroundColor = "rgba(168, 85, 247, 0.4)"
                      ripple.style.transform = "scale(0)"
                      ripple.style.left = `${x}px`
                      ripple.style.top = `${y}px`
                      ripple.style.animation = "ripple 0.6s linear"

                      e.currentTarget.appendChild(ripple)

                      setTimeout(() => {
                        ripple.remove()
                      }, 600)
                    }}
                  >
                    <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">About</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="skills"
                    className="data-[state=active]:bg-purple-600 hover:bg-purple-500/20 transition-colors duration-200 relative overflow-hidden group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top

                      const ripple = document.createElement("span")
                      ripple.style.position = "absolute"
                      ripple.style.width = "5px"
                      ripple.style.height = "5px"
                      ripple.style.borderRadius = "50%"
                      ripple.style.backgroundColor = "rgba(168, 85, 247, 0.4)"
                      ripple.style.transform = "scale(0)"
                      ripple.style.left = `${x}px`
                      ripple.style.top = `${y}px`
                      ripple.style.animation = "ripple 0.6s linear"

                      e.currentTarget.appendChild(ripple)

                      setTimeout(() => {
                        ripple.remove()
                      }, 600)
                    }}
                  >
                    <Code className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">Skills</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="achievements"
                    className="data-[state=active]:bg-purple-600 hover:bg-purple-500/20 transition-colors duration-200 relative overflow-hidden group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top

                      const ripple = document.createElement("span")
                      ripple.style.position = "absolute"
                      ripple.style.width = "5px"
                      ripple.style.height = "5px"
                      ripple.style.borderRadius = "50%"
                      ripple.style.backgroundColor = "rgba(168, 85, 247, 0.4)"
                      ripple.style.transform = "scale(0)"
                      ripple.style.left = `${x}px`
                      ripple.style.top = `${y}px`
                      ripple.style.animation = "ripple 0.6s linear"

                      e.currentTarget.appendChild(ripple)

                      setTimeout(() => {
                        ripple.remove()
                      }, 600)
                    }}
                  >
                    <Trophy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">Achieve</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="vrchat"
                    className="data-[state=active]:bg-purple-600 hover:bg-purple-500/20 transition-colors duration-200 relative overflow-hidden group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top

                      const ripple = document.createElement("span")
                      ripple.style.position = "absolute"
                      ripple.style.width = "5px"
                      ripple.style.height = "5px"
                      ripple.style.borderRadius = "50%"
                      ripple.style.backgroundColor = "rgba(168, 85, 247, 0.4)"
                      ripple.style.transform = "scale(0)"
                      ripple.style.left = `${x}px`
                      ripple.style.top = `${y}px`
                      ripple.style.animation = "ripple 0.6s linear"

                      e.currentTarget.appendChild(ripple)

                      setTimeout(() => {
                        ripple.remove()
                      }, 600)
                    }}
                  >
                    <ImageIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">VRChat</span>
                  </TabsTrigger>
                </TabsList>

                {/* About Me */}
                <TabsContent value="about">
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    <motion.div variants={item}>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-purple-400">💻 About Me</h3>
                          <p className="mb-4 text-gray-300">
                            <span className="font-bold">Japanese Student | Junior Full Stack Engineer</span>
                          </p>
                          <p className="mb-4 text-gray-300">Passionate about coding with TypeScript, and Python.</p>
                          <div className="mb-6 bg-gradient-to-r from-purple-900/30 to-green-900/30 p-3 rounded-lg border border-green-500/30">
                            <p className="text-green-400 font-medium flex items-center">
                              <CheckCircle2 className="w-5 h-5 mr-2" />
                              Currently learning Kubernetes!
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* 年齢 */}
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm"
                            >
                              <div className="flex items-center mb-2">
                                <Cake className="w-5 h-5 text-purple-400 mr-2" />
                                <h4 className="text-lg font-medium text-purple-300">Age</h4>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                  {age}
                                </span>
                                <span className="ml-2 text-gray-400">years old</span>
                              </div>
                            </motion.div>
                            {/* 誕生日 */}
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-4 rounded-lg border border-purple-500/30 backdrop-blur-sm"
                            >
                              <div className="flex items-center mb-2">
                                <Gift className="w-5 h-5 text-purple-400 mr-2" />
                                <h4 className="text-lg font-medium text-purple-300">Birthday</h4>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-xl font-bold text-gray-200">May 22nd</span>
                                {daysUntilBirthday > 0 && (
                                  <span className="ml-2 text-sm text-gray-400">({daysUntilBirthday} days left)</span>
                                )}
                                {daysUntilBirthday === 0 && (
                                  <span className="ml-2 text-sm text-green-400 font-bold animate-pulse">Today! 🎉</span>
                                )}
                              </div>
                            </motion.div>
                          </div>

                          {/* 誕生日カウントダウン（誕生日が近い場合のみ表示） */}
                          {daysUntilBirthday <= 30 && daysUntilBirthday > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 rounded-lg mb-6 border border-purple-500/30"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Calendar className="w-5 h-5 text-purple-400 mr-2" />
                                  <h4 className="font-medium text-purple-300">Birthday Countdown</h4>
                                </div>
                                <div className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                  {daysUntilBirthday} {daysUntilBirthday === 1 ? "day" : "days"}
                                </div>
                              </div>
                              <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                                <motion.div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${100 - (daysUntilBirthday / 30) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </motion.div>
                          )}

                          {/* 誕生日アニメーション（誕生日当日のみ表示） */}
                          {daysUntilBirthday === 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="relative bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-6 rounded-lg mb-6 border border-pink-500/50 overflow-hidden"
                            >
                              <h4 className="text-xl font-bold text-center mb-2 text-white">🎉 Happy Birthday! 🎂</h4>
                              <p className="text-center text-gray-300 mb-4">May all your wishes come true!</p>

                              {/* 紙吹雪アニメーション */}
                              {Array.from({ length: 30 }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-2 h-2 rounded-full"
                                  style={{
                                    top: `-10%`,
                                    left: `${Math.random() * 100}%`,
                                    background: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                                  }}
                                  animate={{
                                    y: ["0%", "800%"],
                                    x: [0, Math.random() * 40 - 20],
                                    opacity: [1, 0.8, 0],
                                    rotate: [0, 360],
                                  }}
                                  transition={{
                                    duration: 3 + Math.random() * 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    delay: Math.random() * 5,
                                    ease: "easeInOut",
                                  }}
                                />
                              ))}
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
                {/* Skills */}
                <TabsContent value="skills">
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    <motion.div variants={item}>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-purple-400">🛠 Tech Stack</h3>
                          <div className="flex flex-wrap gap-2">
                            {techStack.map((tech, index) => (
                              <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.1 }}
                                className="transition-all"
                              >
                                <Badge className={`${tech.color} ${tech.textColor} hover:${tech.color}`}>
                                  {tech.name}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div variants={item}>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-purple-400">🌱 Learning & Planned Skills</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 学習中のスキル */}
                            <div>
                              <h4 className="text-lg font-medium text-purple-300 mb-3 flex items-center">
                                <BookOpen className="w-4 h-4 mr-2" /> Currently Learning
                              </h4>
                              <ul className="space-y-2">
                                {learningSkills
                                  .filter((skill) => skill.status === "learning")
                                  .map((skill) => (
                                    <motion.li
                                      key={skill.name}
                                      className="flex items-center bg-gray-700/50 p-3 rounded-md"
                                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                                      <span className="text-gray-200">{skill.name}</span>
                                    </motion.li>
                                  ))}
                              </ul>
                            </div>
                            {/* 学習予定のスキル */}
                            <div>
                              <h4 className="text-lg font-medium text-purple-300 mb-3 flex items-center">
                                <Clock className="w-4 h-4 mr-2" /> Planning to Learn
                              </h4>
                              <ul className="space-y-2">
                                {learningSkills
                                  .filter((skill) => skill.status === "planned")
                                  .map((skill) => (
                                    <motion.li
                                      key={skill.name}
                                      className="flex items-center bg-gray-700/50 p-3 rounded-md"
                                      whileHover={{ x: 5, transition: { duration: 0.2 } }}
                                    >
                                      <Clock className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
                                      <span className="text-gray-200">{skill.name}</span>
                                    </motion.li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
                {/* Achievements */}
                <TabsContent value="achievements">
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    <motion.div variants={item}>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-purple-400">🏆 Gaming Achievements</h3>
                          <div className="grid gap-4 md:grid-cols-3">
                            {achievements.map((achievement, index) => (
                              <motion.div
                                key={achievement.title}
                                whileHover={{ scale: 1.05 }}
                                className="bg-gray-900 p-4 rounded-lg border border-gray-700"
                              >
                                <h4 className="font-medium text-gray-300 mb-1">{achievement.title}</h4>
                                <p className="text-xl font-bold text-purple-400">{achievement.rank}</p>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    <motion.div variants={item}>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-purple-400">🎮 Gaming Setup</h3>
                          <div className="space-y-3 text-gray-300">
                            <p className="flex justify-between">
                              <span>CPU</span>
                              <span className="text-purple-300">Intel Core i7 - 14700F</span>
                            </p>
                            <p className="flex justify-between">
                              <span>GPU</span>
                              <span className="text-purple-300">NVIDIA RTX 4070</span>
                            </p>
                            <p className="flex justify-between">
                              <span>RAM</span>
                              <span className="text-purple-300">48GB DDR4 3600MHz</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Monitor</span>
                              <span className="text-purple-300">27" 165Hz IPS</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Mouse</span>
                              <span className="text-purple-300">Razer Viper V3 Pro</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Sensitivity(VALORANT)</span>
                              <span className="text-purple-300">400dpi 0.4</span>
                            </p>
                            <p className="flex justify-between">
                              <span>Sensitivity(Overwatch2)</span>
                              <span className="text-purple-300">1600dpi 2.75</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
                {/* VRChat Photos */}
                <TabsContent value="vrchat">
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    <motion.div variants={item}>
                      <Card className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-purple-400">📸 VRChat Photos</h3>
                          <p className="text-gray-300 mb-6">
                            ぼくのお気に入りのぶいちゃの写真たち！！ <br />
                            ※ここは趣味のことなので日本語で書いてます！
                          </p>
                          <VRChatGallery />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
              </Tabs>
              {/* フッター */}
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-16 text-center text-gray-400 text-sm"
              >
                <p>© {new Date().getFullYear()} Tako. All rights reserved.</p>
                <p className="mt-2">
                  <a
                    href="https://x.com/Tako_0522"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Twitter className="w-4 h-4 mr-1" /> @Tako_0522
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </p>
              </motion.footer>
            </div>
            {/* 背景パーティクル */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
              <ParticleBackground />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ParticleBackground() {
  return (
    <div className="relative w-full h-full">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-purple-500 opacity-20"
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
            duration: 10 + Math.random() * 20,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  )
}
