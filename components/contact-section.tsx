"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface ContactSectionProps {
  onCopyDiscord: () => void
  discordCopied: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function ContactSection({ onCopyDiscord, discordCopied }: ContactSectionProps) {
  const [emailHovered, setEmailHovered] = useState(false)
  const [discordHovered, setDiscordHovered] = useState(false)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-6"
    >
      {/* Heading */}
      <motion.div variants={itemVariants} className="text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="block w-12 h-px bg-gradient-to-r from-transparent to-white/40" />
          <span className="text-white/50 text-xs tracking-[0.35em] uppercase font-light">Get in Touch</span>
          <span className="block w-12 h-px bg-gradient-to-l from-transparent to-white/40" />
        </div>
        <h3 className="text-5xl lg:text-6xl font-bold text-white tracking-tight">
          Let&apos;s{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Connect
            </span>
            <motion.span
              className="absolute -inset-x-2 -inset-y-1 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 rounded-lg blur-sm -z-0"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </h3>
      </motion.div>

      {/* Contact Methods */}
      <div className="w-full grid grid-cols-[1fr_auto_1fr] gap-6 items-stretch mb-16">
        {/* Email Block */}
        <motion.a
          variants={itemVariants}
          href="mailto:tako.work.contact@gmail.com"
          className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden cursor-pointer"
          onMouseEnter={() => setEmailHovered(true)}
          onMouseLeave={() => setEmailHovered(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: emailHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: emailHovered ? 1 : 0, scaleX: emailHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Icon */}
            <div className="relative">
              <motion.div
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-400/20 flex items-center justify-center"
                animate={{ borderColor: emailHovered ? "rgba(34,211,238,0.4)" : "rgba(34,211,238,0.2)" }}
              >
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </motion.div>
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-2 rounded-2xl border border-cyan-400/30"
                animate={{
                  opacity: emailHovered ? [0, 0.6, 0] : 0,
                  scale: emailHovered ? [0.9, 1.1, 0.9] : 1,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="text-center">
              <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-light">Email</p>
              <p className="text-white font-medium text-sm tracking-wide group-hover:text-cyan-300 transition-colors duration-300">
                tako.work.contact
              </p>
              <p className="text-white/40 text-sm group-hover:text-cyan-300/40 transition-colors duration-300">
                @gmail.com
              </p>
            </div>
          </div>
        </motion.a>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center gap-3"
        >
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <div className="relative">
            <motion.div
              className="w-2 h-2 rounded-full bg-white/30"
              animate={{
                boxShadow: [
                  "0 0 4px rgba(255,255,255,0.2)",
                  "0 0 12px rgba(255,255,255,0.5)",
                  "0 0 4px rgba(255,255,255,0.2)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </motion.div>

        {/* Discord Block */}
        <motion.div
          variants={itemVariants}
          className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden cursor-pointer"
          onClick={onCopyDiscord}
          onMouseEnter={() => setDiscordHovered(true)}
          onMouseLeave={() => setDiscordHovered(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: discordHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          {/* Top accent line */}
          <motion.div
            className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: discordHovered ? 1 : 0, scaleX: discordHovered ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />

          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Icon */}
            <div className="relative">
              <motion.div
                className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-400/20 flex items-center justify-center"
                animate={{ borderColor: discordHovered ? "rgba(129,140,248,0.4)" : "rgba(129,140,248,0.2)" }}
              >
                <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </motion.div>
              {/* Pulse ring */}
              <motion.div
                className="absolute -inset-2 rounded-2xl border border-indigo-400/30"
                animate={{
                  opacity: discordHovered ? [0, 0.6, 0] : 0,
                  scale: discordHovered ? [0.9, 1.1, 0.9] : 1,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="text-center">
              <p className="text-white/40 text-xs tracking-widest uppercase mb-2 font-light">Discord</p>
              <motion.p
                className="text-white font-medium text-sm tracking-wide group-hover:text-indigo-300 transition-colors duration-300"
                animate={discordCopied ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {discordCopied ? (
                  <span className="text-emerald-400">Copied!</span>
                ) : (
                  "tako._.v"
                )}
              </motion.p>
              <p className="text-white/40 text-xs mt-1 group-hover:text-indigo-300/40 transition-colors duration-300">
                click to copy
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom message */}
      <motion.div variants={itemVariants} className="text-center">
        <p className="text-white/30 text-sm tracking-wide font-light">
          お気軽にご連絡ください
        </p>
      </motion.div>
    </motion.div>
  )
}
