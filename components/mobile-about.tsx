"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Gift, Code } from "lucide-react"
import Image from "next/image"

interface MobileAboutProps {
  daysUntilBirthday: number
  discordStatus?: string | null
}

export default function MobileAbout({ daysUntilBirthday, discordStatus }: MobileAboutProps) {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* アイコンのみ（上に表示） */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.1 }}
        className="flex-shrink-0 flex flex-col items-center"
      >
        <div className="relative w-[200px] h-[160px] sm:w-[250px] sm:h-[200px] flex items-center justify-center">
          {/* 装飾画像（Discordデコレーション） */}
          <Image
            src="https://cdn.discordapp.com/avatar-decoration-presets/a_48b8411feb1e80a69048fc65b3275b75.png?size=256&passthrough=true"
            alt="Decoration"
            width={256}
            height={256}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
            style={{ width: '180px', height: '180px' }}
            draggable="false"
          />
          {/* アイコン本体 */}
          <motion.div
            className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-visible relative z-40"
          >
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="https://avatars.githubusercontent.com/u/108514947?v="
                alt="Tako"
                fill
                sizes="(max-width: 640px) 160px, 192px"
                className="object-cover"
              />
            </div>
            {/* Discordステータスインジケーター */}
            {discordStatus && (
              <div className="absolute bottom-0 right-2 z-[60]" style={{ 
                width: '20px', 
                height: '20px',
                filter: 'drop-shadow(0 0 0 3px #1a1a1a)'
              }}>
                {discordStatus === 'online' ? (
                  <svg width="20" height="20" viewBox="0 0 12 12" className="w-full h-full">
                    <circle cx="6" cy="6" r="6" fill="rgb(69, 163, 102)" />
                  </svg>
                ) : discordStatus === 'idle' ? (
                  <svg width="20" height="20" viewBox="0 0 12 12" className="w-full h-full">
                    <defs>
                      <mask id="svg-mask-status-idle-mobile">
                        <rect width="12" height="12" fill="black" />
                        <circle cx="6" cy="6" r="5" fill="white" />
                        <path d="M 6 1 A 5 5 0 0 0 1 6 L 6 6 Z" fill="black" />
                      </mask>
                    </defs>
                    <rect width="12" height="12" x="0" y="0" fill="#ffc04e" mask="url(#svg-mask-status-idle-mobile)" />
                  </svg>
                ) : discordStatus === 'dnd' ? (
                  <svg width="20" height="20" viewBox="0 0 12 12" className="w-full h-full">
                    <circle cx="6" cy="6" r="6" fill="rgb(237, 66, 69)" />
                    <rect x="3" y="5" width="6" height="2" fill="white" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 12 12" className="w-full h-full">
                    <circle cx="6" cy="6" r="6" fill="rgb(116, 127, 141)" />
                    <circle cx="6" cy="6" r="4" fill="rgb(79, 84, 92)" />
                  </svg>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* About Meの内容（下に表示） */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
        className="w-full"
      >
      <Card className="bg-transparent border-transparent">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-cyan-300">💻 About Me</h3>
          <p className="mb-3 sm:mb-4 text-white text-base sm:text-lg">
            <span className="font-bold">🎓CS Japanese Student | Full Stack Engineer</span>
          </p>
          <p className="mb-4 sm:mb-6 text-white text-sm sm:text-base">
            2008年大阪生まれ。現在はWeb開発を中心に学習しており、バックエンドとフロントエンドの両方を扱えるフルスタックエンジニアです！2025年10月からmuclaseという会社でエンジニアとしてインターンで働いております！
            <br />
            <span className="block text-xs sm:text-sm italic text-gray-200 mt-2">
              Born in Osaka in 2008. Currently studying web development and is a full-stack engineer capable of both back-end and front-end development. Starting in October 2025, I have been working as an intern at a company called muclase!
            </span>
          </p>
          <div className="grid grid-cols-1 gap-4">
            {/* 誕生日 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-transparent backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-lg text-white"
            >
              <div className="flex items-center mb-2">
                <Gift className="w-5 h-5 text-white mr-2" />
                <h4 className="text-lg font-medium text-white">Birthday</h4>
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
            {/* Skills */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-transparent backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 transition-all duration-300 rounded-2xl p-4 sm:p-5 shadow-lg text-white"
            >
              <div className="flex items-center mb-4">
                <Code className="w-5 h-5 text-white mr-2" />
                <h4 className="text-lg font-medium text-white">Skills</h4>
              </div>
              <div className="flex justify-center">
                <Image
                  src="/images/skills.svg"
                  alt="Skills"
                  width={600}
                  height={100}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>
            </motion.div>
          </div>

          {/* 誕生日カウントダウン（誕生日が近い場合のみ表示） */}
          {daysUntilBirthday <= 30 && daysUntilBirthday > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 rounded-lg mt-4 border border-purple-500/30"
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
              className="relative bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-6 rounded-lg mt-4 border border-pink-500/50 overflow-hidden"
            >
              <h4 className="text-xl font-bold text-center mb-2 text-white">🎉 Happy Birthday! 🎂</h4>
              <p className="text-center text-gray-300 mb-4">May all your wishes come true!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}
