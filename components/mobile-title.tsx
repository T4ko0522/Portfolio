"use client"

import { motion } from "framer-motion"
import { Rock_Salt } from "next/font/google"

const rockSalt = Rock_Salt({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export default function MobileTitle() {
  return (
    <motion.h1
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
      className={`${rockSalt.className} text-[8vw] sm:text-[10vw] font-bold leading-none whitespace-nowrap text-center`}
    >
      <span className="text-transparent [text-stroke:2px_#ffffff] sm:[text-stroke:10px_#ffffff] [-webkit-text-stroke:2px_#ffffff] sm:[-webkit-text-stroke:10px_#ffffff]">
        I&apos;m T4ko0522!
      </span>
    </motion.h1>
  )
}
