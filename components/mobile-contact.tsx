"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface MobileContactProps {
  onCopyDiscord: () => void
  discordCopied: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function MobileContact({ onCopyDiscord, discordCopied }: MobileContactProps) {
  const [emailActive, setEmailActive] = useState(false)
  const [discordActive, setDiscordActive] = useState(false)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center w-full px-5"
    >
      {/* Heading */}
      <motion.div variants={itemVariants} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="block w-8 h-px bg-gradient-to-r from-transparent to-white/30" />
          <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-light">Get in Touch</span>
          <span className="block w-8 h-px bg-gradient-to-l from-transparent to-white/30" />
        </div>
        <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Let&apos;s{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Connect
          </span>
        </h3>
      </motion.div>

      {/* Contact cards stacked */}
      <div className="w-full flex flex-col gap-4 mb-10 max-w-sm mx-auto">
        {/* Email */}
        <motion.a
          variants={itemVariants}
          href="mailto:tako.work.contact@gmail.com"
          className="group relative flex items-center gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden"
          onTouchStart={() => setEmailActive(true)}
          onTouchEnd={() => setEmailActive(false)}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 to-blue-500/4 pointer-events-none"
            animate={{ opacity: emailActive ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ opacity: emailActive ? 0.8 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="relative z-10 w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-400/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>

          <div className="relative z-10 min-w-0">
            <p className="text-white/40 text-[10px] tracking-widest uppercase font-light mb-0.5">Email</p>
            <p className="text-white text-sm font-medium tracking-wide truncate">
              tako.work.contact@gmail.com
            </p>
          </div>

          <svg className="relative z-10 w-4 h-4 text-white/20 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </motion.a>

        {/* Divider */}
        <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 py-1">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-white/20"
            animate={{
              boxShadow: [
                "0 0 3px rgba(255,255,255,0.15)",
                "0 0 8px rgba(255,255,255,0.4)",
                "0 0 3px rgba(255,255,255,0.15)",
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>

        {/* Discord */}
        <motion.div
          variants={itemVariants}
          className="group relative flex items-center gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden cursor-pointer"
          onClick={onCopyDiscord}
          onTouchStart={() => setDiscordActive(true)}
          onTouchEnd={() => setDiscordActive(false)}
          whileTap={{ scale: 0.97 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/8 to-violet-500/4 pointer-events-none"
            animate={{ opacity: discordActive ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="absolute top-0 left-[5%] right-[5%] h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            animate={{ opacity: discordActive ? 0.8 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <div className="relative z-10 w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-400/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>

          <div className="relative z-10 min-w-0">
            <p className="text-white/40 text-[10px] tracking-widest uppercase font-light mb-0.5">Discord</p>
            <motion.p
              className="text-white text-sm font-medium tracking-wide"
              animate={discordCopied ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.25 }}
            >
              {discordCopied ? (
                <span className="text-emerald-400">Copied!</span>
              ) : (
                "tako._.v"
              )}
            </motion.p>
          </div>

          <span className="relative z-10 text-white/20 text-[10px] tracking-wider uppercase ml-auto flex-shrink-0">
            tap to copy
          </span>
        </motion.div>
      </div>

      {/* Message */}
      <motion.p variants={itemVariants} className="text-white/25 text-xs tracking-wide font-light text-center">
        お気軽にご連絡ください
      </motion.p>
    </motion.div>
  )
}
