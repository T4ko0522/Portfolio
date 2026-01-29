"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, User, Briefcase, Mail, Menu, X } from "lucide-react"
import localFont from "next/font/local"

const huninn = localFont({
  src: "../public/Huninn-Regular.ttf",
  display: "swap",
})

interface MobileHeaderProps {
  onNavigate: (sectionId: string) => void
}

export default function MobileHeader({ onNavigate }: MobileHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      sectionId: "main",
    },
    {
      id: "about",
      label: "About",
      icon: User,
      sectionId: "about",
    },
    {
      id: "works",
      label: "Works",
      icon: Briefcase,
      sectionId: "works",
    },
    {
      id: "contact",
      label: "Contact",
      icon: Mail,
      sectionId: "contact",
    },
  ]

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId)
    setIsOpen(false)
  }

  return (
    <>
      {/* ハンバーガーメニューボタン */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-transparent border-0 text-white hover:bg-white/5 transition-colors"
        aria-label="メニューを開く"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </motion.button>

      {/* メニューオーバーレイ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景オーバーレイ（完全透明・クリックで閉じる用） */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-transparent z-40"
            />
            
            {/* メニューパネル（右端から黒がフェードアウトするグラデーション） */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 backdrop-blur-lg border-l border-white/10 z-50 shadow-2xl bg-gradient-to-l from-transparent via-black/5 to-black/20"
            >
              <div className="flex flex-col h-full pt-20 px-6">
                <nav className="flex flex-col gap-3 w-full">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleNavigate(item.sectionId)}
                        className={`${huninn.className} flex items-center gap-4 px-5 py-4 rounded-lg text-white hover:bg-white/10 transition-colors text-left w-full`}
                      >
                        <Icon className="w-6 h-6 flex-shrink-0" />
                        <span className="text-lg">{item.label}</span>
                      </motion.button>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
