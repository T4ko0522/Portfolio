"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import TypingAnimation from "./typing-animation"
import { introTexts } from "../lib/constants"

const OutlineTitle = dynamic(() => import("./outline-title"), { ssr: false })

const MobileTypingAnimation = dynamic<{
  texts: string[]
  className?: string
}>(() => import("./mobile-typing-animation"), { ssr: false })

interface MainSectionProps {
  pacificoClassName: string
  isMobile: boolean
}

export default function MainSection({ pacificoClassName, isMobile }: MainSectionProps) {
  return (
    <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pt-32 pb-16">
      {/* タイトル */}
      <div className="w-full text-center mb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.15 }}
          className={`${pacificoClassName} ${isMobile ? "text-4xl" : "text-6xl md:text-7xl lg:text-8xl"} font-bold mb-10 flex items-center justify-center gap-4`}
        >
          <Image
            src="https://raw.githubusercontent.com/ABSphreak/ABSphreak/master/gifs/Hi.gif"
            alt="Hi"
            width={80}
            height={80}
            className={isMobile ? "w-12 h-12" : "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 inline-block"}
            unoptimized
          />
          <span className="text-white">Hi there!</span>
        </motion.div>
        <OutlineTitle />
      </div>

      <div className="container mx-auto px-4 max-w-4xl text-center"></div>

      {/* タイピングアニメーション（introText） */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.3 }}
        className="w-full mt-25 flex justify-center items-center px-4"
      >
        {isMobile ? (
          <MobileTypingAnimation
            texts={introTexts}
            className={`${pacificoClassName} text-xl sm:text-4xl md:text-5xl lg:text-6xl`}
          />
        ) : (
          <TypingAnimation
            texts={introTexts}
            className={`${pacificoClassName} text-4xl md:text-5xl lg:text-6xl`}
          />
        )}
      </motion.div>

      {/* SNSリンク */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.5 }}
        className="flex justify-center space-x-6 mb-16 pointer-events-auto"
      >
        <motion.a
          href="https://github.com/T4ko0522"
          target="_blank"
          rel="noopener noreferrer"
          className="relative p-4 rounded-full bg-transparent"
          aria-label="GitHub"
          whileHover={{ scale: 1.3, rotate: 7 }}
        >
          <svg
            className="w-10 h-10 text-white relative z-10"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </motion.a>

        <motion.a
          href="https://www.youtube.com/@%E3%82%BF%E3%82%B3%E3%81%95%E3%82%93%E3%81%A7%E3%81%99"
          target="_blank"
          rel="noopener noreferrer"
          className="relative p-4 rounded-full bg-transparent"
          aria-label="YouTube"
          whileHover={{ scale: 1.3, rotate: 7 }}
        >
          <svg
            className="w-10 h-10 text-white relative z-10"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </motion.a>

        <motion.a
          href="https://x.com/_A1m3r"
          target="_blank"
          rel="noopener noreferrer"
          className="relative p-4 rounded-full bg-transparent"
          aria-label="Twitter"
          whileHover={{ scale: 1.3, rotate: 7 }}
        >
          <svg
            className="w-10 h-10 text-white relative z-10"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </motion.a>
      </motion.div>
    </div>
  )
}
