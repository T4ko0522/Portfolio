"use client"

import { useEffect, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import type { ProjectDetail } from "../types/project"

interface WorksCarouselProps {
  projects: ProjectDetail[]
  position: MotionValue<number>
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  minIndex: number
  maxIndex: number
}

const SLOTS = 4
const CENTER_SLOT = 1.5
const VELOCITY_THRESHOLD = 400
const SNAP_RATIO = 0.2

export default function WorksCarousel({
  projects,
  position,
  activeIndex,
  onActiveIndexChange,
  minIndex,
  maxIndex,
}: WorksCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const x = useMotionValue(0)

  const cardWidth = containerWidth / SLOTS

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth)
      }
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // position(MotionValue) → x の同期
  useEffect(() => {
    if (cardWidth === 0) return
    const apply = (p: number) => {
      x.set((CENTER_SLOT - (minIndex + p)) * cardWidth)
    }
    apply(position.get())
    const unsub = position.on("change", apply)
    return unsub
  }, [position, cardWidth, minIndex, x])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (cardWidth === 0) return
    const currentX = x.get()
    const baseIndex = CENTER_SLOT - currentX / cardWidth

    let target = Math.round(baseIndex)
    if (info.velocity.x < -VELOCITY_THRESHOLD) target = Math.ceil(baseIndex + SNAP_RATIO)
    else if (info.velocity.x > VELOCITY_THRESHOLD) target = Math.floor(baseIndex - SNAP_RATIO)

    target = Math.max(minIndex, Math.min(maxIndex, target))
    onActiveIndexChange(target)
  }

  return (
    <div className="w-full select-none">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden py-16"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[8%] bg-gradient-to-r from-black/60 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[8%] bg-gradient-to-l from-black/60 to-transparent" />

        <motion.div
          className="flex items-center"
          style={{ x }}
          drag={cardWidth > 0 ? "x" : false}
          dragConstraints={{
            left: (CENTER_SLOT - maxIndex) * cardWidth,
            right: (CENTER_SLOT - minIndex) * cardWidth,
          }}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              activeIndex={activeIndex}
              x={x}
              cardWidth={cardWidth}
            />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

interface ProjectCardProps {
  project: ProjectDetail
  index: number
  activeIndex: number
  x: MotionValue<number>
  cardWidth: number
}

function ProjectCard({ project, index, activeIndex, x, cardWidth }: ProjectCardProps) {
  const opacity = useTransform(x, (xVal) => {
    if (cardWidth === 0) return 1
    const distance = Math.abs(index - CENTER_SLOT + xVal / cardWidth)
    if (distance <= 1) return 1 - 0.1 * distance
    if (distance <= 2) return 0.9 - 0.5 * (distance - 1)
    if (distance <= 3) return 0.4 - 0.4 * (distance - 2)
    return 0
  })

  const scale = useTransform(x, (xVal) => {
    if (cardWidth === 0) return 1
    const distance = Math.abs(index - CENTER_SLOT + xVal / cardWidth)
    if (distance <= 1) return 1.15 - 0.2 * distance
    if (distance <= 2) return 0.95 - 0.2 * (distance - 1)
    if (distance <= 3) return 0.75 - 0.2 * (distance - 2)
    return 0.55
  })

  const isActive = index === activeIndex

  return (
    <motion.div
      className="px-3"
      style={{
        width: cardWidth || `${100 / SLOTS}%`,
        flexShrink: 0,
        opacity,
        scale,
        zIndex: isActive ? 5 : 1,
      }}
    >
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm">
        <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
          {project.imageUrl && (
            <Image
              src={project.imageUrl}
              alt={project.imageAlt}
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
        </div>

        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="truncate text-base font-semibold text-white">{project.title}</h4>
            <div className="flex shrink-0 items-center gap-1.5">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Visit ${project.title}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/10 hover:text-cyan-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`View ${project.title} on GitHub`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-gray-400">
            {project.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
