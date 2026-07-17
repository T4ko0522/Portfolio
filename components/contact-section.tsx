"use client"

import { motion } from "framer-motion"
import ContactForm from "./contact-form"

interface ContactSectionProps {
  onCopyDiscord: () => void
  discordCopied: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function ContactSection({ onCopyDiscord, discordCopied }: ContactSectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-6xl mx-auto px-8 lg:px-12"
    >
      {/* Top meta bar */}
      <motion.div
        variants={itemVariants}
        className="flex items-baseline justify-between mb-6 pb-3 border-b border-white/10"
      >
        <span className="text-[10px] tracking-[0.4em] uppercase text-white/50 font-light">
          Issue 04 — Contact
        </span>
        <span className="text-[10px] tracking-[0.4em] uppercase text-white/30 font-light hidden md:block">
          MMXXVI
        </span>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Left column — editorial intro */}
        <motion.div variants={itemVariants} className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-white leading-[0.95] tracking-tight text-5xl lg:text-6xl xl:text-7xl">
              Let&apos;s
              <br />
              <em className="not-italic">work</em>
              <br />
              together.
            </h2>

            <p className="mt-8 text-white/60 text-sm leading-relaxed font-light max-w-sm">
              ご依頼・ご相談なんでもお気軽にどうぞ。
              <br />
              通常 1〜2 日以内に返信します。
            </p>
          </div>

          <ul className="mt-10 space-y-1.5 text-white/50 text-xs tracking-wide font-light">
            <li className="flex items-center gap-3">
              <span className="w-3 h-px bg-white/30" />
              <span>Full-stack development</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-px bg-white/30" />
              <span>Web design &amp; interactions</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-3 h-px bg-white/30" />
              <span>Collaborations &amp; consulting</span>
            </li>
          </ul>
        </motion.div>

        {/* Right column — form */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <ContactForm variant="desktop" />
        </motion.div>
      </div>

      {/* Bottom contact info */}
      <motion.div
        variants={itemVariants}
        className="mt-10 pt-5 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-3"
      >
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] tracking-[0.4em] uppercase text-white/30 font-light">
            Direct
          </span>
          <a
            href="mailto:tako.work.contact@gmail.com"
            className="text-white/70 hover:text-white text-sm tracking-wide font-light transition-colors"
          >
            tako.work.contact@gmail.com
          </a>
        </div>

        <button
          type="button"
          onClick={onCopyDiscord}
          className="flex items-baseline gap-3 group"
        >
          <span className="text-[10px] tracking-[0.4em] uppercase text-white/30 font-light">
            Discord
          </span>
          <span className="text-white/70 group-hover:text-white text-sm tracking-wide font-light transition-colors">
            {discordCopied ? <span className="text-emerald-300/80">copied</span> : "tako._.v"}
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 font-light">
          </span>
        </button>
      </motion.div>
    </motion.div>
  )
}
