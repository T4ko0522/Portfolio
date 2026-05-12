"use client"

import dynamic from "next/dynamic"
import { useMotionValue } from "framer-motion"
import type { ProjectDetail } from "../types/project"

const MobileWorks = dynamic<{
  projects: ProjectDetail[]
}>(() => import("./mobile/works"), { ssr: false })

const WorksCarousel = dynamic<{
  projects: ProjectDetail[]
  position: ReturnType<typeof useMotionValue<number>>
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  minIndex: number
  maxIndex: number
}>(() => import("./works-carousel"), { ssr: false })

interface WorksSectionProps {
  isMobile: boolean
  projects: ProjectDetail[]
  position: ReturnType<typeof useMotionValue<number>>
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  minIndex: number
  maxIndex: number
  worksSteps: number
  worksPadding: number
}

export default function WorksSection({
  isMobile,
  projects,
  position,
  activeIndex,
  onActiveIndexChange,
  minIndex,
  maxIndex,
  worksSteps,
  worksPadding,
}: WorksSectionProps) {
  if (isMobile) {
    return (
      <div className="min-h-full w-full flex items-center justify-center py-16">
        <MobileWorks projects={projects} />
      </div>
    )
  }

  return (
    <div
      className="relative w-full"
      style={{ height: `${(worksSteps + 1 + 2 * worksPadding) * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        <WorksCarousel
          projects={projects}
          position={position}
          activeIndex={activeIndex}
          onActiveIndexChange={onActiveIndexChange}
          minIndex={minIndex}
          maxIndex={maxIndex}
        />
      </div>
    </div>
  )
}
