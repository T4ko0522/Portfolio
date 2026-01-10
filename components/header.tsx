"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Code, User, Briefcase } from "lucide-react"
import localFont from "next/font/local"

const huninn = localFont({
  src: "../public/Huninn-Regular.ttf",
  display: "swap",
})

interface HeaderProps {
  onNavigate: (sectionId: string) => void
}

export default function Header({ onNavigate }: HeaderProps) {
  const [hoveredButtons, setHoveredButtons] = useState<Set<string>>(new Set())

  const handleRippleEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
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
  }

  const navItems = [
    {
      id: "about",
      label: "About",
      icon: User,
      sectionId: "about",
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code,
      sectionId: "skills",
    },
    {
      id: "works",
      label: "Works",
      icon: Briefcase,
      sectionId: "works",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.7 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center bg-transparent pointer-events-auto"
    >
      <div className="container mx-auto px-4 max-w-4xl w-full">
        <div className="grid grid-cols-3 gap-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.id}
                onMouseEnter={() =>
                  setHoveredButtons((prev) => new Set(prev).add(item.id))
                }
                onMouseLeave={() =>
                  setHoveredButtons((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(item.id)
                    return newSet
                  })
                }
                onClick={(e) => {
                  handleRippleEffect(e)
                  onNavigate(item.sectionId)
                }}
                className={`${huninn.className} text-white bg-transparent hover:bg-blue-500/10 transition-colors duration-200 relative overflow-x-visible overflow-y-hidden group px-4 py-2 rounded-md flex items-center justify-center`}
              >
                <span
                  className={`text-reveal-container mr-2 ${
                    hoveredButtons.has(item.id)
                      ? "reveal-active"
                      : hoveredButtons.size > 0
                        ? "reveal-reverse"
                        : ""
                  }`}
                >
                  <Icon className="w-4 h-4 inline-block" />
                </span>
                <span
                  className={`text-reveal-container ${
                    hoveredButtons.has(item.id)
                      ? "reveal-active"
                      : hoveredButtons.size > 0
                        ? "reveal-reverse"
                        : ""
                  }`}
                >
                  <span className="inline-block">{item.label}</span>
                </span>
                {/* 下線アニメーション */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-500 ease-out origin-left" />
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
