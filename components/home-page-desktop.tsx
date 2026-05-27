"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion"
import { cn } from "../lib/utils"
import {
  sectionBackgrounds,
  projectDetails,
  pageTransition,
} from "../lib/constants"
import type { SpotifyTrack } from "../types/spotify"
import Image from "next/image"
import Header from "./header"
import ContactSection from "./contact-section"
import MainSection from "./main-section"
import AboutSection from "./about-section"
import ScrollIndicator from "./scroll-indicator"
import dynamic from "next/dynamic"

const BgShader = dynamic(
  () => import("./bg-shader").then((m) => ({ default: m.BgShader })),
  { ssr: false }
)

const DottedSurface = dynamic(
  () => import("./dotted-surface").then((m) => ({ default: m.DottedSurface })),
  { ssr: false }
)

const ShootingStars = dynamic(
  () => import("./shooting-stars").then((m) => ({ default: m.ShootingStars })),
  { ssr: false }
)

type WorksCarouselProps = {
  projects: typeof projectDetails
  position: MotionValue<number>
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  minIndex: number
  maxIndex: number
}
const WorksCarousel = dynamic<WorksCarouselProps>(
  () => import("./works-carousel"),
  { ssr: false }
)

interface HomePageDesktopProps {
  pacificoClassName: string
  daysUntilBirthday: number
  spotifyTrack: SpotifyTrack | null
  isSpotifyLoading: boolean
  discordStatus: "online" | "idle" | "dnd" | "offline" | null
  discordCopied: boolean
  onCopyDiscord: () => void
}

const WORKS_PADDING = 0.4
const DWELL_SMALL = 20
const DWELL_FULL = 180
const WORKS_VH = (projectDetails.length + 2 * WORKS_PADDING) * 100

// 境界 hysteresis: 進捗 0.005 (~3.6vh) のデッドバンドで currentSection flip を抑止。
const HYSTERESIS = 0.005

// 遷移ロック時間 (pageTransition.duration の ms 換算)。
const TRANSITION_LOCK_MS = 600

type SectionKey = "main" | "about" | "works" | "contact"
const SECTION_ORDER: SectionKey[] = ["main", "about", "works", "contact"]

export default function HomePageDesktop({
  pacificoClassName,
  daysUntilBirthday,
  spotifyTrack,
  isSpotifyLoading,
  discordStatus,
  discordCopied,
  onCopyDiscord,
}: HomePageDesktopProps) {
  // works カルーセル
  const worksMinIndex = 0
  const worksMaxIndex = Math.max(0, projectDetails.length - 1)
  const [worksActiveIndex, setWorksActiveIndex] = useState(worksMinIndex)
  const worksPosition = useMotionValue(0)

  // スクロール容器
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ container: scrollContainerRef, layoutEffect: false })

  // 各 section の inner overflow-y-auto への ref:
  //   - aboutInnerRef: scrollHeight を実測して outer vh を動的決定
  //   - contactInnerRef: form の inner スクロールを indicator 進捗に合算
  const aboutInnerRef = useRef<HTMLDivElement | null>(null)
  const contactInnerRef = useRef<HTMLDivElement | null>(null)
  const [aboutVh, setAboutVh] = useState(DWELL_FULL)

  const sectionHeights = useMemo(
    () => ({
      main: 180,
      about: aboutVh,
      works: WORKS_VH,
      contact: DWELL_SMALL,
    }),
    [aboutVh],
  )
  const TOTAL_VH = useMemo(
    () => sectionHeights.main + sectionHeights.about + sectionHeights.works + sectionHeights.contact,
    [sectionHeights],
  )
  const sectionRanges = useMemo(() => {
    let acc = 0
    const map: Record<SectionKey, [number, number]> = {
      main: [0, 0],
      about: [0, 0],
      works: [0, 0],
      contact: [0, 0],
    }
    for (const key of SECTION_ORDER) {
      const start = acc / TOTAL_VH
      acc += sectionHeights[key]
      const end = acc / TOTAL_VH
      map[key] = [start, end]
    }
    return map
  }, [sectionHeights, TOTAL_VH])
  const sectionRangesRef = useRef(sectionRanges)
  sectionRangesRef.current = sectionRanges

  const [currentSection, setCurrentSection] = useState<SectionKey>("main")
  const currentSectionRef = useRef<SectionKey>("main")
  const [sectionProgress, setSectionProgress] = useState(0)

  // インジケーター用 sectionProgress: outer (section 内 pixel) + inner.scrollTop を
  // 仮想 1 本のスクロールとして合算する (master の getCombinedScrollState 思想)。
  // contact のように inner overflow が outer budget より大きい section でも
  // inner スクロールが indicator に正しく反映される。
  const getInnerEl = (key: SectionKey): HTMLDivElement | null => {
    if (key === "about") return aboutInnerRef.current
    if (key === "contact") return contactInnerRef.current
    return null
  }

  const recomputeSectionProgress = (vOverride?: number) => {
    const ranges = sectionRangesRef.current
    const cur = currentSectionRef.current
    const [start, end] = ranges[cur]
    const v = vOverride ?? scrollYProgress.get()
    const container = scrollContainerRef.current
    const outerMaxPx = container ? container.scrollHeight - container.clientHeight : 0
    const outerSectionPx = Math.max(0, (end - start) * outerMaxPx)
    const outerInSectionPx = Math.max(0, Math.min(outerSectionPx, (v - start) * outerMaxPx))

    const inner = getInnerEl(cur)
    const innerMaxPx = inner ? Math.max(0, inner.scrollHeight - inner.clientHeight) : 0
    const innerScrollPx = inner ? inner.scrollTop : 0

    const combined = outerInSectionPx + innerScrollPx
    const combinedMax = outerSectionPx + innerMaxPx
    const progress = combinedMax > 0 ? Math.max(0, Math.min(1, combined / combinedMax)) : 0
    setSectionProgress((prev) => (Math.abs(prev - progress) < 1e-4 ? prev : progress))
  }

  // 遷移ロック: currentSection 変更直後 TRANSITION_LOCK_MS 間は新たな section commit を抑制。
  const isTransitioningRef = useRef(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  const commitSection = (target: SectionKey) => {
    currentSectionRef.current = target
    setCurrentSection(target)
    isTransitioningRef.current = true
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current)
    }
    transitionTimeoutRef.current = window.setTimeout(() => {
      isTransitioningRef.current = false
      transitionTimeoutRef.current = null
    }, TRANSITION_LOCK_MS)
  }

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const ranges = sectionRangesRef.current
    let target = currentSectionRef.current
    let targetIdx = SECTION_ORDER.indexOf(target)

    while (targetIdx < SECTION_ORDER.length - 1) {
      const nextKey = SECTION_ORDER[targetIdx + 1]
      const [nextStart] = ranges[nextKey]
      if (v >= nextStart + HYSTERESIS) {
        targetIdx++
        target = nextKey
      } else break
    }
    while (targetIdx > 0) {
      const prevKey = SECTION_ORDER[targetIdx - 1]
      const [, prevEnd] = ranges[prevKey]
      if (v <= prevEnd - HYSTERESIS) {
        targetIdx--
        target = prevKey
      } else break
    }

    if (target !== currentSectionRef.current && !isTransitioningRef.current) {
      commitSection(target)
    }

    recomputeSectionProgress(v)
  })

  // inner overflow-y-auto の scroll で recomputeSectionProgress を発火 (outer は動かないため)
  useEffect(() => {
    const targets = [aboutInnerRef.current, contactInnerRef.current].filter(
      (el): el is HTMLDivElement => el != null,
    )
    if (targets.length === 0) return
    const onInnerScroll = () => recomputeSectionProgress()
    for (const el of targets) {
      el.addEventListener("scroll", onInnerScroll, { passive: true })
    }
    return () => {
      for (const el of targets) {
        el.removeEventListener("scroll", onInnerScroll)
      }
    }
    // currentSection 変化で再評価対象が変わる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection])

  // about の inner overflow を実測して outer vh を切り替える。
  useEffect(() => {
    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const el = aboutInnerRef.current
        if (!el) return
        const overflow = el.scrollHeight - el.clientHeight > 1
        const next = overflow ? DWELL_SMALL : DWELL_FULL
        setAboutVh((prev) => (prev === next ? prev : next))
      })
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
    }
  }, [daysUntilBirthday])

  // 遷移ロック中の wheel/touch を preventDefault してスナップ感を保つ。
  useEffect(() => {
    const blockWheel = (e: WheelEvent) => {
      if (isTransitioningRef.current) e.preventDefault()
    }
    const blockTouch = (e: TouchEvent) => {
      if (isTransitioningRef.current) e.preventDefault()
    }
    window.addEventListener("wheel", blockWheel, { passive: false })
    window.addEventListener("touchmove", blockTouch, { passive: false })
    return () => {
      window.removeEventListener("wheel", blockWheel)
      window.removeEventListener("touchmove", blockTouch)
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
        transitionTimeoutRef.current = null
      }
    }
  }, [])

  // works カルーセル: works section 内の進捗を 0..projects.length-1 にマップ
  const worksLocalSpan = sectionRanges.works[1] - sectionRanges.works[0]
  const worksInnerStart = sectionRanges.works[0] + (WORKS_PADDING * 100 / sectionHeights.works) * worksLocalSpan
  const worksInnerEnd = sectionRanges.works[1] - (WORKS_PADDING * 100 / sectionHeights.works) * worksLocalSpan
  const worksCarouselPos = useTransform(
    scrollYProgress,
    [worksInnerStart, worksInnerEnd],
    [worksMinIndex, worksMaxIndex],
    { clamp: true }
  )

  useEffect(() => {
    const unsub = worksCarouselPos.on("change", (p) => {
      worksPosition.set(p)
      const idx = Math.max(worksMinIndex, Math.min(worksMaxIndex, Math.round(p)))
      setWorksActiveIndex((prev) => (prev === idx ? prev : idx))
    })
    return () => unsub()
  }, [worksCarouselPos, worksPosition, worksMinIndex, worksMaxIndex])

  const navigateToSection = (sectionId: string) => {
    const container = scrollContainerRef.current
    if (!container) return
    const key = (SECTION_ORDER as readonly string[]).includes(sectionId)
      ? (sectionId as SectionKey)
      : "main"
    if (key === currentSectionRef.current) return
    const [start] = sectionRangesRef.current[key]
    const max = container.scrollHeight - container.clientHeight
    const offset = (HYSTERESIS + 0.001) * max
    container.scrollTo({ top: start * max + offset, behavior: "auto" })
    commitSection(key)
  }

  const handleWorksActiveIndexChange = (idx: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const span = worksInnerEnd - worksInnerStart
    const stepsTotal = Math.max(1, worksMaxIndex - worksMinIndex)
    const targetProgress = worksInnerStart + ((idx - worksMinIndex) / stepsTotal) * span
    const max = container.scrollHeight - container.clientHeight
    container.scrollTo({ top: targetProgress * max, behavior: "smooth" })
  }

  // 各セクションの離散 animate ターゲット (me-vs-cur で x/opacity を決める)
  const animateOf = (key: SectionKey): { x: string; opacity: number } => {
    const cur = SECTION_ORDER.indexOf(currentSection)
    const me = SECTION_ORDER.indexOf(key)
    if (me === cur) return { x: "0%", opacity: 1 }
    return { x: me > cur ? "100%" : "-100%", opacity: 0 }
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-black no-scrollbar"
      >
        <div className="relative w-full" style={{ height: `${TOTAL_VH}vh` }}>
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            {/* ===== Main ===== */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={animateOf("main")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "main" ? "auto" : "none" }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{
                  filter: sectionBackgrounds[0].filter || "none",
                  transform: "scale(1.3) translateZ(0px)",
                }}
              >
                <Image
                  src={sectionBackgrounds[0].image}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: sectionBackgrounds[0].position || "center" }}
                  priority
                />
              </div>
              <div className="relative z-10 w-full h-full">
                <MainSection pacificoClassName={pacificoClassName} isMobile={false} />
              </div>
            </motion.div>

            {/* ===== About ===== */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={animateOf("about")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "about" ? "auto" : "none" }}
            >
              <BgShader
                colors={["#f97316", "#fb923c", "#fdba74", "#fda4af", "#fb7185", "#f472b6"]}
                distortion={2}
                swirl={1}
                speed={0.8}
                offsetX={0.08}
                veilOpacity="bg-black/20"
              />
              <div
                ref={aboutInnerRef}
                className="relative z-10 w-full h-full overflow-y-auto no-scrollbar"
              >
                <AboutSection
                  isMobile={false}
                  daysUntilBirthday={daysUntilBirthday}
                  discordStatus={discordStatus}
                  spotifyTrack={spotifyTrack}
                  isSpotifyLoading={isSpotifyLoading}
                />
              </div>
            </motion.div>

            {/* ===== Works ===== */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={animateOf("works")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "works" ? "auto" : "none" }}
            >
              <DottedSurface className="absolute inset-0" speed={0.02}>
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full",
                    "bg-[radial-gradient(ellipse_at_center,hsl(var(--foreground)/0.1),transparent_50%)]",
                    "blur-[30px]"
                  )}
                />
              </DottedSurface>
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <WorksCarousel
                  projects={projectDetails}
                  position={worksPosition}
                  activeIndex={worksActiveIndex}
                  onActiveIndexChange={handleWorksActiveIndexChange}
                  minIndex={worksMinIndex}
                  maxIndex={worksMaxIndex}
                />
              </div>
            </motion.div>

            {/* ===== Contact ===== */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={animateOf("contact")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "contact" ? "auto" : "none" }}
            >
              <div className="absolute inset-0 pointer-events-none bg-black" style={{ zIndex: 0 }}>
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_80%)]" />
                  <div className="stars absolute inset-0" />
                </div>
                <ShootingStars
                  starColor="#FFFFFF"
                  trailColor="#FFFFFF"
                  minSpeed={15}
                  maxSpeed={35}
                  minDelay={400}
                  maxDelay={1200}
                  maxStars={8}
                />
                <ShootingStars
                  starColor="#FFFFFF"
                  trailColor="#FFFFFF"
                  minSpeed={10}
                  maxSpeed={25}
                  minDelay={600}
                  maxDelay={1500}
                  maxStars={6}
                />
                <ShootingStars
                  starColor="#FFFFFF"
                  trailColor="#FFFFFF"
                  minSpeed={20}
                  maxSpeed={40}
                  minDelay={500}
                  maxDelay={1400}
                  maxStars={7}
                />
              </div>
              <div
                ref={contactInnerRef}
                className="relative z-10 w-full h-full overflow-y-auto no-scrollbar"
              >
                <div className="min-h-full w-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center px-4 py-16 lg:py-20">
                    <ContactSection onCopyDiscord={onCopyDiscord} discordCopied={discordCopied} />
                  </div>
                  <motion.footer
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="pt-6 pb-20 text-center"
                  >
                    <p className="text-gray-400 text-sm">
                      © {new Date().getFullYear()} T4ko0522. All rights reserved.
                    </p>
                  </motion.footer>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Header onNavigate={navigateToSection} />

      <ScrollIndicator currentSection={currentSection} sectionProgress={sectionProgress} />
    </>
  )
}
