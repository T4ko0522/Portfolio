"use client"

import { motion } from "framer-motion"
import ContactForm from "../contact-form"

interface ContactProps {
  onCopyDiscord: () => void
  discordCopied: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function Contact({ onCopyDiscord, discordCopied }: ContactProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-md mx-auto px-5"
    >
      {/* Meta bar */}
      <motion.div
        variants={itemVariants}
        className="flex items-baseline justify-between mb-5 pb-2.5 border-b border-white/10"
      >
        <span className="text-[9px] tracking-[0.35em] uppercase text-white/50 font-light">
          Issue 04 — Contact
        </span>
        <span className="text-[9px] tracking-[0.35em] uppercase text-white/30 font-light">
          MMXXVI
        </span>
      </motion.div>

      {/* Editorial heading */}
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="font-serif text-white leading-[0.95] tracking-tight text-4xl sm:text-5xl">
          Let&apos;s
          <br />
          <em className="not-italic">work</em>
          <br />
          together.
        </h2>
        <p className="mt-4 text-white/60 text-xs leading-relaxed font-light">
          ご依頼・ご相談なんでもお気軽にどうぞ。通常 1〜2 日以内に返信します。
        </p>
      </motion.div>

      {/* Form */}
      <motion.div variants={itemVariants} className="mb-6">
        <ContactForm variant="mobile" />
      </motion.div>

      {/* Bottom contact info */}
      <motion.div
        variants={itemVariants}
        className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-2.5"
      >
        <a
          href="mailto:tako.work.contact@gmail.com"
          className="flex items-baseline justify-between"
        >
          <span className="text-[9px] tracking-[0.35em] uppercase text-white/30 font-light">
            Direct
          </span>
          <span className="text-white/70 text-xs tracking-wide font-light truncate ml-3">
            tako.work.contact@gmail.com
          </span>
        </a>

        <button
          type="button"
          onClick={onCopyDiscord}
          className="flex items-baseline justify-between"
        >
          <span className="text-[9px] tracking-[0.35em] uppercase text-white/30 font-light">
            Discord
          </span>
          <span className="text-xs tracking-wide font-light ml-3">
            {discordCopied ? (
              <span className="text-emerald-300/80">copied</span>
            ) : (
              <span className="text-white/70">tako._.v · tap to copy</span>
            )}
          </span>
        </button>
      </motion.div>
    </motion.div>
  )
}
