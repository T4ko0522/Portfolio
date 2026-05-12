"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

const TOTAL_DAYS = 30

type Particle = {
  id: number
  emoji: string
  left: number
  delay: number
  duration: number
  size: number
  drift: number
}

type Confetti = {
  id: number
  left: number
  delay: number
  duration: number
  rotation: number
  color: string
  width: number
  height: number
  shape: "rect" | "circle"
}

const PARTICLE_EMOJIS = ["🎈", "🎂", "🎁", "✨", "🎉", "🪄", "🍰"]
const CONFETTI_COLORS = ["#f472b6", "#c084fc", "#fb923c", "#facc15", "#22d3ee", "#34d399", "#f87171"]

function useParticles(count: number) {
  const [particles, setParticles] = useState<Particle[]>([])
  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: PARTICLE_EMOJIS[Math.floor(Math.random() * PARTICLE_EMOJIS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 4,
        size: 12 + Math.random() * 12,
        drift: (Math.random() - 0.5) * 60,
      }))
    )
  }, [count])
  return particles
}

function useConfetti(count: number) {
  const [confetti, setConfetti] = useState<Confetti[]>([])
  useEffect(() => {
    setConfetti(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3,
        rotation: Math.random() * 720 - 360,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        width: 6 + Math.random() * 6,
        height: 8 + Math.random() * 10,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      }))
    )
  }, [count])
  return confetti
}

interface BirthdayCountdownProps {
  daysUntilBirthday: number
}

export function BirthdayCountdown({ daysUntilBirthday }: BirthdayCountdownProps) {
  const particles = useParticles(14)

  const [displayDays, setDisplayDays] = useState(TOTAL_DAYS)
  useEffect(() => {
    const duration = 1400
    const start = TOTAL_DAYS
    const end = daysUntilBirthday
    const startTime = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayDays(Math.round(start + (end - start) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [daysUntilBirthday])

  const progress = Math.max(0, Math.min(1, 1 - daysUntilBirthday / TOTAL_DAYS))
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - progress * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="relative overflow-hidden rounded-2xl mt-4 p-5 border border-pink-400/40 shadow-lg shadow-pink-500/10"
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(168,85,247,0.35) 0%, rgba(236,72,153,0.35) 40%, rgba(251,146,60,0.28) 75%, rgba(168,85,247,0.35) 100%)",
          backgroundSize: "300% 300%",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute select-none"
            style={{
              left: `${p.left}%`,
              bottom: -24,
              fontSize: p.size,
              filter: "drop-shadow(0 0 6px rgba(236,72,153,0.6))",
            }}
            animate={{
              y: [0, -260],
              x: [0, p.drift],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.15, 0.8, 1],
            }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </div>

      <div className="relative flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <defs>
              <linearGradient id="bd-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <motion.circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="url(#bd-ring-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white leading-none">{displayDays}</span>
            <span className="text-[10px] text-pink-100/80 uppercase tracking-widest mt-0.5">days</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <motion.span
              animate={{ rotate: [0, 18, -18, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex"
            >
              <Sparkles className="w-4 h-4 text-pink-200" />
            </motion.span>
            <h4 className="text-xs font-semibold text-pink-100/90 tracking-[0.18em] uppercase">
              Birthday in
            </h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-orange-200 drop-shadow-[0_0_12px_rgba(236,72,153,0.35)]">
              {daysUntilBirthday}
            </span>
            <span className="text-sm text-pink-100/80 font-medium">
              {daysUntilBirthday === 1 ? "day" : "days"} left
            </span>
          </div>
          <p className="text-[11px] text-pink-100/60 mt-1 tracking-wide">
            May 22nd <span className="opacity-50">·</span> Counting down…
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function BirthdayCelebration() {
  const confetti = useConfetti(80)
  const particles = useParticles(18)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, type: "spring", bounce: 0.35 }}
      className="relative overflow-hidden rounded-2xl mt-4 p-8 border-2 border-pink-400/60 shadow-2xl shadow-pink-500/30"
      style={{
        background:
          "radial-gradient(circle at 25% 20%, rgba(236,72,153,0.45), transparent 55%), radial-gradient(circle at 75% 80%, rgba(168,85,247,0.45), transparent 55%), linear-gradient(135deg, rgba(76,20,90,0.85), rgba(120,30,80,0.85), rgba(76,20,90,0.85))",
      }}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-2xl"
        animate={{
          boxShadow: [
            "inset 0 0 40px rgba(236,72,153,0.35)",
            "inset 0 0 80px rgba(236,72,153,0.7)",
            "inset 0 0 40px rgba(236,72,153,0.35)",
          ],
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((c) => (
          <motion.span
            key={c.id}
            className="absolute block"
            style={{
              left: `${c.left}%`,
              top: -20,
              width: c.width,
              height: c.height,
              background: c.color,
              borderRadius: c.shape === "circle" ? "9999px" : "2px",
              boxShadow: `0 0 8px ${c.color}80`,
            }}
            animate={{
              y: ["0%", "700%"],
              rotate: [0, c.rotation],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              repeat: Infinity,
              ease: "easeIn",
              times: [0, 0.1, 0.85, 1],
            }}
          />
        ))}
        {particles.map((p) => (
          <motion.span
            key={`p-${p.id}`}
            className="absolute select-none"
            style={{
              left: `${p.left}%`,
              bottom: -30,
              fontSize: p.size,
              filter: "drop-shadow(0 0 8px rgba(251,191,36,0.55))",
            }}
            animate={{
              y: [0, -340],
              x: [0, p.drift],
              opacity: [0, 1, 1, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.15, 0.85, 1],
            }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </div>

      <div className="relative text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.span
            className="text-4xl sm:text-5xl inline-block"
            animate={{ rotate: [-18, 18, -18], y: [0, -8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            🎂
          </motion.span>
          <motion.h4
            className="text-2xl sm:text-4xl font-extrabold bg-clip-text text-transparent leading-tight"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #fff 0%, #fda4af 25%, #f0abfc 50%, #fef08a 75%, #fff 100%)",
              backgroundSize: "200% auto",
            }}
            animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            Happy Birthday!
          </motion.h4>
          <motion.span
            className="text-4xl sm:text-5xl inline-block"
            animate={{ rotate: [18, -18, 18], y: [0, -8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          >
            🎉
          </motion.span>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm sm:text-base text-pink-50/90 italic"
        >
          May all your wishes come true ✨
        </motion.p>
      </div>
    </motion.div>
  )
}
