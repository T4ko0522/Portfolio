import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMotionValueEvent, useScroll } from "framer-motion"

export type SectionKey = "main" | "about" | "works" | "contact"

const SECTION_ORDER: SectionKey[] = ["main", "about", "works", "contact"]
const WORKS_PADDING = 0.4
const DWELL_SMALL = 20
const DWELL_FULL = 180
const HYSTERESIS = 0.005
const TRANSITION_LOCK_MS = 600

export function useDesktopScroll(projectCount: number, daysUntilBirthday: number | null) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const aboutInnerRef = useRef<HTMLDivElement | null>(null)
  const contactInnerRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ container: scrollContainerRef, layoutEffect: false })
  const [aboutVh, setAboutVh] = useState(DWELL_FULL)
  const sectionHeights = useMemo(
    () => ({
      main: DWELL_FULL,
      about: aboutVh,
      works: (projectCount + 2 * WORKS_PADDING) * 100,
      contact: DWELL_SMALL,
    }),
    [aboutVh, projectCount],
  )
  const totalVh = useMemo(
    () => Object.values(sectionHeights).reduce((total, height) => total + height, 0),
    [sectionHeights],
  )
  const sectionRanges = useMemo(() => {
    let accumulated = 0
    const ranges = {} as Record<SectionKey, [number, number]>
    for (const key of SECTION_ORDER) {
      const start = accumulated / totalVh
      accumulated += sectionHeights[key]
      ranges[key] = [start, accumulated / totalVh]
    }
    return ranges
  }, [sectionHeights, totalVh])
  const sectionRangesRef = useRef(sectionRanges)
  useEffect(() => {
    sectionRangesRef.current = sectionRanges
  }, [sectionRanges])

  const [currentSection, setCurrentSection] = useState<SectionKey>("main")
  const currentSectionRef = useRef<SectionKey>("main")
  const [sectionProgress, setSectionProgress] = useState(0)
  const isTransitioningRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  const getInnerElement = useCallback((key: SectionKey) => {
    if (key === "about") return aboutInnerRef.current
    if (key === "contact") return contactInnerRef.current
    return null
  }, [])

  const recomputeSectionProgress = useCallback(
    (progressOverride?: number) => {
      const [start, end] = sectionRangesRef.current[currentSectionRef.current]
      const progress = progressOverride ?? scrollYProgress.get()
      const container = scrollContainerRef.current
      const outerMax = container ? container.scrollHeight - container.clientHeight : 0
      const outerSection = Math.max(0, (end - start) * outerMax)
      const outerCurrent = Math.max(0, Math.min(outerSection, (progress - start) * outerMax))
      const inner = getInnerElement(currentSectionRef.current)
      const innerMax = inner ? Math.max(0, inner.scrollHeight - inner.clientHeight) : 0
      const combinedMax = outerSection + innerMax
      const combined = outerCurrent + (inner?.scrollTop ?? 0)
      const next = combinedMax > 0 ? Math.max(0, Math.min(1, combined / combinedMax)) : 0
      setSectionProgress((previous) => (Math.abs(previous - next) < 1e-4 ? previous : next))
    },
    [getInnerElement, scrollYProgress],
  )

  const commitSection = (target: SectionKey, anchor: "entry" | "start" = "entry") => {
    const previousIndex = SECTION_ORDER.indexOf(currentSectionRef.current)
    const targetIndex = SECTION_ORDER.indexOf(target)
    currentSectionRef.current = target
    setCurrentSection(target)
    const container = scrollContainerRef.current
    if (container && previousIndex !== targetIndex) {
      const [start, end] = sectionRangesRef.current[target]
      const max = container.scrollHeight - container.clientHeight
      const offset = (HYSTERESIS + 0.001) * max
      const top =
        anchor === "start" || targetIndex > previousIndex
          ? start * max + offset
          : end * max - offset
      container.scrollTo({ top, behavior: "auto" })
    }
    isTransitioningRef.current = true
    if (transitionTimeoutRef.current !== null) window.clearTimeout(transitionTimeoutRef.current)
    transitionTimeoutRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false
      transitionTimeoutRef.current = null
    }, TRANSITION_LOCK_MS)
  }

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const ranges = sectionRangesRef.current
    let target = currentSectionRef.current
    let index = SECTION_ORDER.indexOf(target)
    while (index < SECTION_ORDER.length - 1) {
      const next = SECTION_ORDER[index + 1]
      if (progress < ranges[next][0] + HYSTERESIS) break
      target = next
      index += 1
    }
    while (index > 0) {
      const previous = SECTION_ORDER[index - 1]
      if (progress > ranges[previous][1] - HYSTERESIS) break
      target = previous
      index -= 1
    }
    if (target !== currentSectionRef.current && !isTransitioningRef.current) commitSection(target)
    recomputeSectionProgress(progress)
  })

  useEffect(() => {
    const targets = [aboutInnerRef.current, contactInnerRef.current].filter(
      (element): element is HTMLDivElement => element !== null,
    )
    const onScroll = () => recomputeSectionProgress()
    for (const element of targets) element.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      for (const element of targets) element.removeEventListener("scroll", onScroll)
    }
  }, [currentSection, recomputeSectionProgress])

  useEffect(() => {
    let firstFrame = 0
    let secondFrame = 0
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const element = aboutInnerRef.current
        if (!element) return
        setAboutVh(element.scrollHeight - element.clientHeight > 1 ? DWELL_SMALL : DWELL_FULL)
      })
    })
    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [daysUntilBirthday])

  useEffect(() => {
    const blockWheel = (event: WheelEvent) => {
      if (isTransitioningRef.current) event.preventDefault()
    }
    const blockTouch = (event: TouchEvent) => {
      if (isTransitioningRef.current) event.preventDefault()
    }
    window.addEventListener("wheel", blockWheel, { passive: false })
    window.addEventListener("touchmove", blockTouch, { passive: false })
    return () => {
      window.removeEventListener("wheel", blockWheel)
      window.removeEventListener("touchmove", blockTouch)
      if (transitionTimeoutRef.current !== null) window.clearTimeout(transitionTimeoutRef.current)
    }
  }, [])

  const navigateToSection = (sectionId: string) => {
    const key = SECTION_ORDER.includes(sectionId as SectionKey) ? (sectionId as SectionKey) : "main"
    if (key !== currentSectionRef.current) commitSection(key, "start")
  }

  const animateSection = (key: SectionKey) => {
    const currentIndex = SECTION_ORDER.indexOf(currentSection)
    const sectionIndex = SECTION_ORDER.indexOf(key)
    if (sectionIndex === currentIndex) return { x: "0%", opacity: 1 }
    return { x: sectionIndex > currentIndex ? "100%" : "-100%", opacity: 0 }
  }

  return {
    aboutInnerRef,
    animateSection,
    contactInnerRef,
    currentSection,
    navigateToSection,
    scrollContainerRef,
    scrollYProgress,
    sectionHeights,
    sectionProgress,
    sectionRanges,
    totalVh,
  }
}
