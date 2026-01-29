"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { ProjectDetail } from "./project-detail-modal"
import { cn } from "@/lib/utils"

interface MobileWorksProps {
  projects: ProjectDetail[]
  onProjectClick: (project: ProjectDetail) => void
  currentProjectIndex: number
  onProjectIndexChange: (index: number) => void
  containerCenterY?: number
}

const CARD_SLOT_HEIGHT = 140
const CARD_HALF_HEIGHT = 70

export default function MobileWorks({
  projects,
  onProjectClick,
  currentProjectIndex,
  onProjectIndexChange,
  containerCenterY = 0,
}: MobileWorksProps) {
  const touchStartY = useRef(0)
  const centerY = containerCenterY > 0 ? containerCenterY : (typeof window !== "undefined" ? window.innerHeight * 0.45 : 0)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY
    // 50px以上のスワイプでプロジェクト切り替え
    if (diff > 50 && currentProjectIndex < projects.length - 1) {
      onProjectIndexChange(currentProjectIndex + 1)
    } else if (diff < -50 && currentProjectIndex > 0) {
      onProjectIndexChange(currentProjectIndex - 1)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
      className="w-full h-[90vh] overflow-hidden overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full h-full overflow-x-hidden">
        <motion.div
          animate={{
            y: centerY - CARD_HALF_HEIGHT - currentProjectIndex * CARD_SLOT_HEIGHT
          }}
          transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
          className="flex flex-col items-center gap-3 w-full"
          style={{ willChange: 'transform' }}
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              animate={{
                scale: currentProjectIndex === index ? 1.05 : 0.85,
                opacity: currentProjectIndex === index ? 1.0 : 0.5,
              }}
              transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.closest('a')) {
                  return
                }
                onProjectClick(project)
              }}
              className={cn(
                "w-[90%] max-w-md border rounded-lg p-4 sm:p-5 cursor-pointer transition-all duration-300 overflow-hidden",
                currentProjectIndex === index
                  ? "border-blue-500/50 shadow-2xl bg-gray-800/70"
                  : "border-gray-700/30 bg-gray-800/30"
              )}
              style={{ willChange: 'transform, opacity', minHeight: '120px' }}
            >
              <div className="flex items-start justify-between mb-2">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-base sm:text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <h4>{project.title}</h4>
                  </a>
                ) : (
                  <h4 className="text-base sm:text-lg font-bold text-white">{project.title}</h4>
                )}
                <div className="flex gap-2">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      aria-label={`Visit ${project.title}`}
                    >
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                {project.description}
              </p>
              {project.imageUrl && currentProjectIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-lg overflow-hidden bg-gray-900"
                  style={{ 
                    width: 'calc(100% + 2rem)',
                    marginLeft: '-1rem',
                    marginRight: '-1rem',
                  }}
                >
                  <div className="w-full h-40 sm:h-48 relative">
                    <Image
                      src={project.imageUrl}
                      alt={project.imageAlt}
                      fill
                      sizes="100vw"
                      className="object-cover object-center"
                      style={{ objectPosition: 'center' }}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
