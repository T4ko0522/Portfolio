"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import { motion, AnimatePresence } from "framer-motion"
import {
  ExternalLink,
  Code,
  User,
  Calendar,
  Gift,
  Cake,
  Briefcase,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "src/components/ui/tabs"
import LoadingScreen from "../components/loading-screen"
import TypingAnimation from "../components/typing-animation"
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
  
  // 今日の日付を時間部分を無視して設定
  const todayDate = new Date(currentYear, today.getMonth(), today.getDate())
  
  // 今年の誕生日を時間部分を無視して設定
  let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay)

  // 今年の誕生日が過ぎている場合は来年の誕生日を計算
  if (todayDate > nextBirthday) {
    nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay)
  }

  // 日数の差を計算
  const diffTime = nextBirthday.getTime() - todayDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

const introTexts = [
  "VRChatter.",
  "Gamer geek.",
  "Full Stack Engineer.",
  "CS Japanese Student.",
  "\"Araiguma\" community founder.",
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [age, setAge] = useState<number>(0)
  const [daysUntilBirthday, setDaysUntilBirthday] = useState<number>(0)

  // 誕生日の設定（5月22日）
  const birthMonth = 5
  const birthDay = 22

  // クライアント イドレンダリングのためのマウント確認と年齢・カウントダウン計算
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
    { name: "JavaScript", iconKey: "js", color: "bg-yellow-500", textColor: "text-black" },
    { name: "TypeScript", iconKey: "ts", color: "bg-blue-600", textColor: "text-white" },
    { name: "Python", iconKey: "python", color: "bg-yellow-400", textColor: "text-black" },
    { name: "Shell", iconKey: "bash", color: "bg-gray-700", textColor: "text-white" },
    { name: "PowerShell", iconKey: "powershell", color: "bg-blue-600", textColor: "text-white" },
    { name: "React", iconKey: "react", color: "bg-cyan-400", textColor: "text-black" },
    { name: "Next.js", iconKey: "nextjs", color: "bg-black", textColor: "text-white" },
    { name: "Vue", iconKey: "vue", color: "bg-green-500", textColor: "text-white" },
    { name: "Astro", iconKey: "astro", color: "bg-orange-500", textColor: "text-white" },
    { name: "Remix", iconKey: "remix", color: "bg-gray-900", textColor: "text-white" },
    { name: "Angular", iconKey: "angular", color: "bg-red-600", textColor: "text-white" },
    { name: "Tailwind CSS", iconKey: "tailwind", color: "bg-cyan-500", textColor: "text-black" },
    { name: "Material UI", iconKey: "mui", color: "bg-blue-600", textColor: "text-white" },
    { name: "Node.js", iconKey: "nodejs", color: "bg-green-600", textColor: "text-white" },
    { name: "Deno", iconKey: "deno", color: "bg-black", textColor: "text-white" },
    { name: "Express", iconKey: "express", color: "bg-gray-800", textColor: "text-white" },
    { name: "Electron", iconKey: "electron", color: "bg-blue-500", textColor: "text-white" },
    { name: "PostgreSQL", iconKey: "postgresql", color: "bg-blue-700", textColor: "text-white" },
    { name: "MySQL", iconKey: "mysql", color: "bg-gray-800", textColor: "text-white" },
    { name: "Docker", iconKey: "docker", color: "bg-blue-600", textColor: "text-white" },
    { name: "Kubernetes", iconKey: "kubernetes", color: "bg-blue-600", textColor: "text-white" },
    { name: "Google Cloud", iconKey: "gcp", color: "bg-blue-500", textColor: "text-white" },
    { name: "Vercel", iconKey: "vercel", color: "bg-black", textColor: "text-white" },
    { name: "Linux", iconKey: "linux", color: "bg-yellow-500", textColor: "text-black" },
    { name: "Windows", iconKey: "windows", color: "bg-blue-500", textColor: "text-white" },
    { name: "Git", iconKey: "git", color: "bg-orange-600", textColor: "text-white" },
    { name: "GitHub", iconKey: "github", color: "bg-gray-800", textColor: "text-white" },
    { name: "GitLab", iconKey: "gitlab", color: "bg-orange-500", textColor: "text-white" },
    { name: "Postman", iconKey: "postman", color: "bg-orange-500", textColor: "text-white" },
    { name: "VS Code", iconKey: "vscode", color: "bg-blue-600", textColor: "text-white" },
  ]

  return (
    <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="/images/icon.png"
        />
        <link
          rel="preload"
          as="image"
          href="/images/background.png"
        />
      </Head>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-transparent">
            <LoadingScreen key="loading" onLoadingComplete={handleLoadingComplete} />
          </div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen text-white overflow-hidden"
          >
            <div
              className="fixed inset-0 bg-cover"
              style={{
                backgroundImage: "url('/images/background.png')",
                backgroundPosition: "center 95%",
                transform: "scale(1.05)",
                zIndex: -2,
            }}
            />
            {/* 画面幅1500px以下で全画面ブラー、それ以外は中央だけブラー */}
            <div
              className="fixed inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: -1 }}
            >
              <div
                className="backdrop-blur-md bg-black/20 w-full h-full rounded-none xl2:w-[60%] xl2:rounded-xl"
                style={{ height: "100%" }}
              />
            </div>
            <div className="container mx-auto px-4 py-16 max-w-4xl">
              {/* ヘッダー */}
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="text-center mb-16 -mt-12"
              >
                {/* アイコンにホバーエフェクトを追加 */}
                <div className="relative w-[200px] h-[160px] mx-auto mb-2 flex items-center justify-center">
                  {/* 装飾画像（Discordデコレーション）だけを表示 */}
                  <Image
                    src="https://cdn.discordapp.com/avatar-decoration-presets/a_8552f9857793aed0cf816f370e2df3be.png?size=96&passthrough=true"
                    alt="Decoration"
                    width={152}
                    height={152}
                    className="absolute left-1/2 top-1/2 w-[152px] h-[152px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                    draggable="false"
                  />
                  {/* アイコン本体 */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    className="w-32 h-32 rounded-full overflow-hidden relative z-40"
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src="https://avatars.githubusercontent.com/u/108514947?v="
                        alt="Tako"
                        fill
                        sizes="(max-width: 600px) 64px, 128px"
                        className="object-cover"
                        priority
                        placeholder="blur"
                        blurDataURL="/images/icon.png"
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl md:text-5xl font-bold mb-2 flex items-center justify-center gap-2"
                >
                  <span>👋 </span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-500">Hi! I&apos;m T4ko!</span>
                </motion.h1>

                {/* タイピングアニメーション */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-4 flex justify-center items-center px-4"
                >
                  <TypingAnimation
                    texts={introTexts}
                    className="text-base md:text-xl lg:text-2xl"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex justify-center space-x-4"
                >
                  <motion.a
                    href="https://github.com/T4ko0522"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative p-3 rounded-full bg-transparent"
                    aria-label="GitHub"
                    whileHover={{ scale: 1.3, rotate: 7 }}
                  >
                    {/* GitHub SVG */}
                    <svg 
                      className="w-6 h-6 text-white relative z-10" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </motion.a>
                  
                  <motion.a
                    href="https://www.youtube.com/@%E3%82%BF%E3%82%B3%E3%81%95%E3%82%93%E3%81%A7%E3%81%99"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative p-3 rounded-full bg-transparent"
                    aria-label="YouTube"
                    whileHover={{ scale: 1.3, rotate: 7 }}
                  >
                    {/* YouTube SVG */}
                    <svg 
                      className="w-6 h-6 text-white relative z-10" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </motion.a>
                  
                  <motion.a
                    href="https://x.com/T4ko0522"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative p-3 rounded-full bg-transparent"
                    aria-label="Twitter"
                    whileHover={{ scale: 1.3, rotate: 7 }}
                  >
                    {/* Twitter/X SVG */}
                    <svg 
                      className="w-6 h-6 text-white relative z-10" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </motion.a>
                </motion.div>
              </motion.div>

              {/* タブコンテンツ */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid grid-cols-3 mb-8 -mt-10">
                  <TabsTrigger
                    value="about"
                    className="text-white data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/80 data-[state=active]:to-white/40 hover:bg-blue-500/10 transition-colors duration-200 relative overflow-hidden group"
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
                      ripple.style.backgroundColor = "rgba(59, 130, 246, 0.4)"
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
                    className="text-white data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/80 data-[state=active]:to-white/40 hover:bg-blue-500/10 transition-colors duration-200 relative overflow-hidden group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top

                      const ripple = document.createElement("span")
                      ripple.style.position = "absolute"
                      ripple.style.width = "5px"
                      ripple.style.height = "5px"
                      ripple.style.borderRadius = "50%"
                      ripple.style.backgroundColor = "rgba(59, 130, 246, 0.4)"
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
                    value="works"
                    className="text-white data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/80 data-[state=active]:to-white/40 hover:bg-blue-500/10 transition-colors duration-200 relative overflow-hidden group"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top

                      const ripple = document.createElement("span")
                      ripple.style.position = "absolute"
                      ripple.style.width = "5px"
                      ripple.style.height = "5px"
                      ripple.style.borderRadius = "50%"
                      ripple.style.backgroundColor = "rgba(59, 130, 246, 0.4)"
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
                    <Briefcase className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">Works</span>
                  </TabsTrigger>
                </TabsList>

                {/* About Me */}
                <TabsContent value="about">
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    <motion.div variants={item}>
                      <Card className="bg-transparent border-transparent">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4 text-cyan-300">💻 About Me</h3>
                          <p className="mb-4 text-white">
                            <span className="font-bold">🎓CS Japanese Student | Full Stack Engineer</span>
                          </p>
                          <p className="mb-4 text-white">
                            2008年大阪生まれ。現在はWeb開発を中心に学習しており、バックエンドとフロントエンドの両方を扱えるフルスタックエンジニアです！2025年10月からmuclaseという会社でエンジニアとしてインターンで働いております！
                          <br />
                          <span className="block text-sm italic text-gray-200 translate-x-1 mt-1">
                          Born in Osaka in 2008. Currently studying web development and is a full-stack engineer capable of both back-end and front-end development. Starting in October 2025, I have been working as an intern at a company called muclase!
                          </span>
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* 年齢 */}
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              className="bg-transparent border-transparent p-4 rounded-lg text-white"
                            >
                              <div className="flex items-center mb-2">
                                <Cake className="w-5 h-5 text-purple-500 mr-2" />
                                <h4 className="text-lg font-medium text-purple-500">Age</h4>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                  {age}
                                </span>
                                <span className="ml-2 text-gray-200">years old</span>
                              </div>
                            </motion.div>
                            {/* 誕生日 */}
                            <motion.div
                              whileHover={{ scale: 1.03 }}
                              className="bg-transparent border-transparent p-4 rounded-lg text-white"
                            >
                              <div className="flex items-center mb-2">
                                <Gift className="w-5 h-5 text-purple-500 mr-2" />
                                <h4 className="text-lg font-medium text-purple-500">Birthday</h4>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-xl font-bold text-gray-200">May 22nd</span>
                                {daysUntilBirthday > 0 && (
                                  <span className="ml-2 text-sm text-gray-200">({daysUntilBirthday} days left)</span>
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
                      <Card className="bg-transparent border-transparent">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-4">
                            <span>🛠️</span> <span className="text-cyan-300">Tech Stack</span>
                          </h3>
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
                                  <Image 
                                    src={`https://skillicons.dev/icons?i=${tech.iconKey}`} 
                                    alt={tech.name}
                                    width={16}
                                    height={16}
                                    className="w-4 h-4 mr-2"
                                  />
                                  {tech.name}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                </TabsContent>
                {/* Works */}
                <TabsContent value="works">
                  <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
                    <motion.div variants={item}>
                      <Card className="bg-transparent border-transparent">
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-6 text-cyan-300">💼 Works</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Connectix2 */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <a
                                  href="https://cntx.in"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                                >
                                  <h4>Connectix2</h4>
                                </a>
                                <div className="flex gap-2">
                                  <a
                                    href="https://cntx.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                    aria-label="Visit Connectix2"
                                  >
                                    <ExternalLink className="w-5 h-5" />
                                  </a>
                                  <a
                                    href="https://github.com/T4ko0522/Connectix2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-300 transition-colors"
                                    aria-label="View on GitHub"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                  </a>
                                </div>
                              </div>
                              <p className="text-gray-300 mb-4">
                                VRChatのステータスをリアルタイムで更新できるSNSプロフィールサービスです。
                              </p>
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <Image
                                  src="/images/Connectix2.png"
                                  alt="Connectix2 Screenshot"
                                  width={600}
                                  height={400}
                                  className="w-full h-auto object-cover"
                                />
                              </div>
                            </motion.div>

                            {/* contributions-status */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <a
                                  href="https://contributions-status.vercel.app"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                                >
                                  <h4>contributions-status</h4>
                                </a>
                                <div className="flex gap-2">
                                  <a
                                    href="https://contributions-status.vercel.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                    aria-label="Visit contributions-status"
                                  >
                                    <ExternalLink className="w-5 h-5" />
                                  </a>
                                  <a
                                    href="https://github.com/T4ko0522/contributions-status"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-300 transition-colors"
                                    aria-label="View on GitHub"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                  </a>
                                </div>
                              </div>
                              <p className="text-gray-300 mb-4">
                                GitHubのコントリビューショングラフをカスタマイズできるサービスです。
                              </p>
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <Image
                                  src="/images/Contribution.png"
                                  alt="contributions-status Screenshot"
                                  width={600}
                                  height={400}
                                  className="w-full h-auto object-cover"
                                />
                              </div>
                            </motion.div>
                            {/* better-tab */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <a
                                  href="https://better-tab.vercel.app"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                                >
                                  <h4>better-tab</h4>
                                </a>
                                <div className="flex gap-2">
                                  <a
                                    href="https://better-tab.vercel.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                    aria-label="Visit better-tab"
                                  >
                                    <ExternalLink className="w-5 h-5" />
                                  </a>
                                  <a
                                    href="https://github.com/T4ko0522/better-tab"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-300 transition-colors"
                                    aria-label="View on GitHub"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                  </a>
                                </div>
                              </div>
                              <p className="text-gray-300 mb-4">
                                カスタマイズ可能なブラウザの新規タブページです。
                              </p>
                              <div className="mb-4 rounded-lg overflow-hidden">
                                <Image
                                  src="/images/Better-Tab.png"
                                  alt="better-tab Screenshot"
                                  width={600}
                                  height={400}
                                  className="w-full h-auto object-cover"
                                />
                              </div>
                            </motion.div>

                            {/* vscode-to-cursor */}
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-6 hover:border-blue-500/50 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <a
                                  href="https://github.com/T4ko0522/vscode-to-cursor"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                                >
                                  <h4>vscode-to-cursor</h4>
                                </a>
                                <div className="flex gap-2">
                                  <a
                                    href="https://github.com/T4ko0522/vscode-to-cursor"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-gray-300 transition-colors"
                                    aria-label="View on GitHub"
                                  >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                    </svg>
                                  </a>
                                </div>
                              </div>
                              <p className="text-gray-300 mb-4">
                                VS CodeからCursorへの移行を自動化するツールです。拡張機能と設定を簡単に移植できます。
                              </p>
                            </motion.div>
                          </div>
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
                className="mt-16 text-center text-gray-200 text-sm"
              >
                <p>© {new Date().getFullYear()} Tako. All rights reserved.</p>
              </motion.footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
