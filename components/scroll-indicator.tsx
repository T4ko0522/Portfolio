"use client"

import { motion } from "framer-motion"

type SectionKey = "main" | "about" | "works" | "contact"

interface ScrollIndicatorProps {
  currentSection: SectionKey
  sectionProgress: number
}

const labels: Record<SectionKey, { current: string; next: string | null; prev: string | null }> = {
  main: { current: "Home", next: "About", prev: null },
  about: { current: "About", next: "Works", prev: "Home" },
  works: { current: "Works", next: "Contact", prev: "About" },
  contact: { current: "Contact", next: null, prev: "Works" },
}

export default function ScrollIndicator({ currentSection, sectionProgress }: ScrollIndicatorProps) {
  const l = labels[currentSection]

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      {/* Hero での「下スクロール促し」矢印 */}
      {currentSection === "main" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-row items-center gap-2 mb-3 justify-center"
        >
          <span className="text-white/80 text-sm font-medium">Scroll down to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-white/80"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* セクション間プログレスバー */}
      <div className="flex flex-row flex-nowrap items-center gap-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
        {currentSection === "contact" ? (
          <>
            <span className="text-sm font-medium text-white/60">{l.prev}</span>
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${sectionProgress * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white">{l.current}</span>
          </>
        ) : (
          <>
            <span className="text-white text-sm font-medium">{l.current}</span>
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{ width: `${sectionProgress * 100}%` }}
              />
            </div>
            <span className="text-white/60 text-sm">{l.next}</span>
          </>
        )}
      </div>
    </div>
  )
}
