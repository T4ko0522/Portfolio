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
import { getDaysUntilBirthday } from "../lib/utils"
import {
  sectionBackgrounds,
  projectDetails,
  BIRTH_MONTH,
  BIRTH_DAY,
} from "../lib/constants"
import type { SpotifyTrack, SpotifyApiResponse } from "../types/spotify"
import LoadingScreen from "./loading-screen"
import { useIsMobile } from "../hooks/use-mobile"
import Image from "next/image"
import StaggeredCurtainReveal from "./staggered-curtain-reveal"
import Header from "./header"
import ContactSection from "./contact-section"
import MainSection from "./main-section"
import AboutSection from "./about-section"
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

type MobileWorksProps = { projects: typeof projectDetails }
const MobileWorks = dynamic<MobileWorksProps>(() => import("./mobile/works"), { ssr: false })

type MobileContactProps = {
  onCopyDiscord: () => void
  discordCopied: boolean
}
const MobileContact = dynamic<MobileContactProps>(() => import("./mobile/contact"), {
  ssr: false,
})

interface HomePageProps {
  pacificoClassName: string
  initialDaysUntilBirthday: number
}

// ---------- 案 A: 単一スクロール容器 + per-section sticky + useScroll ----------
//
// スクロール容器は scrollContainerRef の overflow-y-auto 1 つだけ。
// 内側は (sectionHeights の総和) vh の空間。その先頭に置いた sticky 要素
// 1 つの中に、4 セクションが absolute で重なり opacity / pointerEvents で切替。
//
// セクションの「進捗範囲」は SECTION_RANGES に正規化済 (0-1)。useScroll の
// scrollYProgress を useTransform で各セクションの opacity / works のカルーセル
// position にマップする。状態の真実の情報源は scrollYProgress 1 つだけ。

const WORKS_PADDING = 0.4 // works セクションの前後余白 (viewport 単位)
const SECTION_HEIGHTS_VH = {
  main: 180,
  about: 180,
  // works: 1 カードあたり 100vh + 前後余白
  works: (projectDetails.length + 2 * WORKS_PADDING) * 100,
  contact: 180,
} as const

const TOTAL_VH = Object.values(SECTION_HEIGHTS_VH).reduce((a, b) => a + b, 0)

// セクションの累積範囲 (進捗 0-1)
const SECTION_RANGES = (() => {
  let acc = 0
  const map: Record<"main" | "about" | "works" | "contact", [number, number]> = {
    main: [0, 0],
    about: [0, 0],
    works: [0, 0],
    contact: [0, 0],
  }
  for (const key of ["main", "about", "works", "contact"] as const) {
    const start = acc / TOTAL_VH
    acc += SECTION_HEIGHTS_VH[key]
    const end = acc / TOTAL_VH
    map[key] = [start, end]
  }
  return map
})()

// セクション間クロスフェードのオーバーラップ幅 (進捗単位)
const FADE = 0.015

type SectionKey = "main" | "about" | "works" | "contact"

const SECTION_ORDER: SectionKey[] = ["main", "about", "works", "contact"]

export default function HomePage({ pacificoClassName, initialDaysUntilBirthday }: HomePageProps) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [daysUntilBirthday, setDaysUntilBirthday] = useState<number>(initialDaysUntilBirthday)
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null)
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false)
  const [discordStatus, setDiscordStatus] = useState<"online" | "idle" | "dnd" | "offline" | null>(null)
  const [discordCopied, setDiscordCopied] = useState(false)

  // works カルーセル
  const worksMinIndex = 0
  const worksMaxIndex = Math.max(0, projectDetails.length - 1)
  const [worksActiveIndex, setWorksActiveIndex] = useState(worksMinIndex)
  const worksPosition = useMotionValue(0)

  // スクロール容器
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  // mounted ガードで初回 render では null を返すため、layoutEffect 段階だと container ref が未設定で警告が出る。
  // layoutEffect: false で useEffect 段階に遅らせる。
  const { scrollYProgress } = useScroll({ container: scrollContainerRef, layoutEffect: false })

  // 現在表示中のセクション (インジケーター用)
  const [currentSection, setCurrentSection] = useState<SectionKey>("main")
  const [sectionProgress, setSectionProgress] = useState(0)

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // 進捗 v から現在 section を判定
    let next: SectionKey = "main"
    for (const key of SECTION_ORDER) {
      const [start, end] = SECTION_RANGES[key]
      if (v >= start && v < end) {
        next = key
        break
      }
      if (v >= end) next = key
    }
    setCurrentSection((prev) => (prev === next ? prev : next))

    const [start, end] = SECTION_RANGES[next]
    const localProgress = end > start ? Math.max(0, Math.min(1, (v - start) / (end - start))) : 0
    setSectionProgress(localProgress)
  })

  // クロスフェード用 opacity (各セクションが自分の範囲で 1、隣接で fade)
  // fadeIn/fadeOut を片側だけ無効化可能 (main 入口 / contact 出口で使用)。
  // useTransform は React Hook のため stops 数は常に 4 で固定し、出力値を切り替える。
  const mkOpacity = (
    key: SectionKey,
    opts: { fadeIn?: boolean; fadeOut?: boolean } = {}
  ) => {
    const [start, end] = SECTION_RANGES[key]
    const fadeIn = opts.fadeIn ?? true
    const fadeOut = opts.fadeOut ?? true

    const inStart = Math.max(0, start - (fadeIn ? FADE : 1e-6))
    const inEnd = start
    const outStart = Math.max(inEnd, fadeOut ? end - FADE : end - 2e-6)
    const outEnd = Math.min(1, end + (fadeOut ? 0 : 1e-6))

    return useTransform(
      scrollYProgress,
      [inStart, inEnd, outStart, outEnd],
      [fadeIn ? 0 : 1, 1, 1, fadeOut ? 0 : 1]
    )
  }

  // 横スライド (元の pageVariants 互換: 次セクションは右から入り、前セクションは左へ抜ける)
  const SLIDE = 0.02
  const mkSlideX = (
    key: SectionKey,
    opts: { slideIn?: boolean; slideOut?: boolean } = {}
  ) => {
    const [start, end] = SECTION_RANGES[key]
    const slideIn = opts.slideIn ?? true
    const slideOut = opts.slideOut ?? true

    const inStart = Math.max(0, start - (slideIn ? SLIDE : 1e-6))
    const inEnd = start
    const outStart = Math.max(inEnd, slideOut ? end - SLIDE : end - 2e-6)
    const outEnd = Math.min(1, end + (slideOut ? 0 : 1e-6))

    return useTransform(
      scrollYProgress,
      [inStart, inEnd, outStart, outEnd],
      [slideIn ? "100%" : "0%", "0%", "0%", slideOut ? "-100%" : "0%"]
    )
  }

  // 端セクションは反対側 fade/slide を切る (main 開始時に既に表示 / contact 末端まで表示し続ける)
  const mainOpacity = mkOpacity("main", { fadeIn: false, fadeOut: true })
  const aboutOpacity = mkOpacity("about")
  const worksOpacity = mkOpacity("works")
  const contactOpacity = mkOpacity("contact", { fadeIn: true, fadeOut: false })

  const mainX = mkSlideX("main", { slideIn: false, slideOut: true })
  const aboutX = mkSlideX("about")
  const worksX = mkSlideX("works")
  const contactX = mkSlideX("contact", { slideIn: true, slideOut: false })

  // works カルーセル: works section 内の進捗を 0..projects.length-1 にマップ
  const worksLocalSpan = SECTION_RANGES.works[1] - SECTION_RANGES.works[0]
  const worksInnerStart = SECTION_RANGES.works[0] + (WORKS_PADDING * 100 / SECTION_HEIGHTS_VH.works) * worksLocalSpan
  const worksInnerEnd = SECTION_RANGES.works[1] - (WORKS_PADDING * 100 / SECTION_HEIGHTS_VH.works) * worksLocalSpan
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

  // ヘッダーからの jump
  const navigateToSection = (sectionId: string) => {
    const container = scrollContainerRef.current
    if (!container) return
    const key = (SECTION_ORDER as readonly string[]).includes(sectionId)
      ? (sectionId as SectionKey)
      : "main"
    const [start] = SECTION_RANGES[key]
    const max = container.scrollHeight - container.clientHeight
    container.scrollTo({ top: start * max, behavior: "smooth" })
  }

  // works カルーセル内のクリックで index ジャンプ → そのカードの中央に来るよう scroll
  const handleWorksActiveIndexChange = (idx: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const span = worksInnerEnd - worksInnerStart
    const stepsTotal = Math.max(1, worksMaxIndex - worksMinIndex)
    const targetProgress = worksInnerStart + ((idx - worksMinIndex) / stepsTotal) * span
    const max = container.scrollHeight - container.clientHeight
    container.scrollTo({ top: targetProgress * max, behavior: "smooth" })
  }

  // マウント・誕生日カウントダウン
  useEffect(() => {
    setMounted(true)
    setDaysUntilBirthday(getDaysUntilBirthday(BIRTH_MONTH, BIRTH_DAY))

    const updateCountdown = () => {
      setDaysUntilBirthday(getDaysUntilBirthday(BIRTH_MONTH, BIRTH_DAY))
    }

    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    let dailyInterval: ReturnType<typeof setInterval>
    const midnightTimer = setTimeout(() => {
      updateCountdown()
      dailyInterval = setInterval(updateCountdown, 24 * 60 * 60 * 1000)
    }, timeUntilMidnight)

    return () => {
      clearTimeout(midnightTimer)
      clearInterval(dailyInterval)
    }
  }, [])

  // Spotify
  useEffect(() => {
    let cancelled = false
    let abortController: AbortController | null = null

    const applyData = (data: SpotifyApiResponse) => {
      const spotifyActivity = data.discord?.activities?.find(
        (activity) => activity.name === "Spotify"
      )

      if (spotifyActivity) {
        const startTime = spotifyActivity.timestamps?.start || 0
        const endTime = spotifyActivity.timestamps?.end || 0
        const now = Date.now()
        const currentPosition = Math.max(0, now - startTime)
        const duration = endTime > startTime ? endTime - startTime : 0

        setSpotifyTrack({
          name: spotifyActivity.details || "",
          artist: spotifyActivity.state || "",
          album: spotifyActivity.assets?.largeText || "",
          albumArtUrl: spotifyActivity.assets?.largeImage || "",
          isPlaying: true,
          currentTime: Math.floor(currentPosition / 1000),
          duration: Math.floor(duration / 1000),
        })
      } else if (data.spotify && data.spotify.isPlaying) {
        setSpotifyTrack({
          name: data.spotify.trackName,
          artist: data.spotify.artistName,
          album: data.spotify.albumName,
          albumArtUrl: data.spotify.albumArt,
          isPlaying: data.spotify.isPlaying,
          currentTime: Math.floor(data.spotify.position / 1000),
          duration: Math.floor(data.spotify.duration / 1000),
        })
      } else {
        setSpotifyTrack(null)
      }

      if (data.discord) {
        setDiscordStatus(data.discord.status)
      }
    }

    const fetchStatus = async () => {
      abortController?.abort()
      abortController = new AbortController()
      try {
        const res = await fetch("/api/v1/spotify-status", {
          signal: abortController.signal,
          cache: "no-store",
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: SpotifyApiResponse = await res.json()
        if (cancelled) return
        if (data.error) {
          console.error("Spotify status error:", data.error)
        } else {
          applyData(data)
        }
      } catch (error) {
        if (cancelled) return
        if (error instanceof DOMException && error.name === "AbortError") return
        console.error("Error fetching spotify status:", error)
      } finally {
        if (!cancelled) setIsSpotifyLoading(false)
      }
    }

    setIsSpotifyLoading(true)
    fetchStatus()
    const intervalId = setInterval(fetchStatus, 5000)

    return () => {
      cancelled = true
      abortController?.abort()
      clearInterval(intervalId)
    }
  }, [])

  const handleLoadingComplete = () => setIsLoading(false)

  const handleCopyDiscord = async () => {
    const discordUsername = "tako._.v"
    try {
      await navigator.clipboard.writeText(discordUsername)
      setDiscordCopied(true)
      setTimeout(() => setDiscordCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy Discord username:", err)
    }
  }

  // インジケーターのラベル
  const indicatorLabels = useMemo(() => {
    const labels: Record<SectionKey, { current: string; next: string | null; prev: string | null }> = {
      main: { current: "Home", next: "About", prev: null },
      about: { current: "About", next: "Works", prev: "Home" },
      works: { current: "Works", next: "Contact", prev: "About" },
      contact: { current: "Contact", next: null, prev: "Works" },
    }
    return labels[currentSection]
  }, [currentSection])

  return (
    <>
      {/* Discord デコレーション (priority preload) */}
      <div className="hidden">
        <Image
          src="https://cdn.discordapp.com/media/v1/collectibles-shop/1306330663070334996/animated"
          alt=""
          width={128}
          height={128}
          priority
          unoptimized
        />
      </div>

      {/* スクロール容器: ここだけが overflow-y-auto。スクロール量の真実の情報源。
          mounted ガードの外に置く理由: useScroll({container}) は初回 render 時に
          ref を読むため、container 要素自身は常に DOM に存在させる必要がある。
          (中身は mounted で gate して isMobile flash を回避) */}
      <div
        ref={scrollContainerRef}
        className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-black no-scrollbar"
      >
        {/* 全セクションの合計 vh を確保するための高さ親 */}
        <div className="relative w-full" style={{ height: `${TOTAL_VH}vh` }}>
          {/* 表示は 1 つの sticky 領域に集約 (全セクションが absolute で重なる) */}
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            {mounted && (
            <>
            {/* === sections === */}
            {/* ===== Main ===== */}
            <motion.div
              className="absolute inset-0"
              style={{ opacity: mainOpacity, x: mainX, pointerEvents: currentSection === "main" ? "auto" : "none" }}
            >
              {/* 背景画像 */}
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
                <MainSection pacificoClassName={pacificoClassName} isMobile={isMobile} />
              </div>
            </motion.div>

            {/* ===== About ===== */}
            <motion.div
              className="absolute inset-0"
              style={{ opacity: aboutOpacity, x: aboutX, pointerEvents: currentSection === "about" ? "auto" : "none" }}
            >
              <BgShader
                colors={["#f97316", "#fb923c", "#fdba74", "#fda4af", "#fb7185", "#f472b6"]}
                distortion={2}
                swirl={1}
                speed={0.8}
                offsetX={0.08}
                veilOpacity="bg-black/20"
              />
              <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar">
                <AboutSection
                  isMobile={isMobile}
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
              style={{ opacity: worksOpacity, x: worksX, pointerEvents: currentSection === "works" ? "auto" : "none" }}
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
                {isMobile ? (
                  <div className="w-full h-full overflow-y-auto no-scrollbar px-4 py-16">
                    <MobileWorks projects={projectDetails} />
                  </div>
                ) : (
                  <WorksCarousel
                    projects={projectDetails}
                    position={worksPosition}
                    activeIndex={worksActiveIndex}
                    onActiveIndexChange={handleWorksActiveIndexChange}
                    minIndex={worksMinIndex}
                    maxIndex={worksMaxIndex}
                  />
                )}
              </div>
            </motion.div>

            {/* ===== Contact ===== */}
            <motion.div
              className="absolute inset-0"
              style={{ opacity: contactOpacity, x: contactX, pointerEvents: currentSection === "contact" ? "auto" : "none" }}
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
              <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar">
                <div className="min-h-full w-full flex flex-col">
                  <div className="flex-1 flex items-center justify-center px-4 py-16 lg:py-20">
                    {isMobile ? (
                      <MobileContact onCopyDiscord={handleCopyDiscord} discordCopied={discordCopied} />
                    ) : (
                      <ContactSection onCopyDiscord={handleCopyDiscord} discordCopied={discordCopied} />
                    )}
                  </div>
                  <motion.footer
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="py-6 text-center"
                  >
                    <p className="text-gray-400 text-sm">
                      © {new Date().getFullYear()} T4ko0522. All rights reserved.
                    </p>
                  </motion.footer>
                </div>
              </div>
            </motion.div>
            </>
            )}
          </div>
        </div>
      </div>

      {/* 固定ナビゲーションヘッダー */}
      {mounted && <Header onNavigate={navigateToSection} />}

      {/* スクロール進行状況インジケーター（下部） */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
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
        <div className="flex flex-row flex-nowrap items-center gap-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          {currentSection === "contact" ? (
            <>
              <span className="text-sm font-medium text-white/60">{indicatorLabels.prev}</span>
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${sectionProgress * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white">{indicatorLabels.current}</span>
            </>
          ) : (
            <>
              <span className="text-white text-sm font-medium">{indicatorLabels.current}</span>
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${sectionProgress * 100}%` }}
                />
              </div>
              <span className="text-white/60 text-sm">{indicatorLabels.next}</span>
            </>
          )}
        </div>
      </div>

      {/* ローディング画面 */}
      <StaggeredCurtainReveal isVisible={isLoading}>
        <LoadingScreen key="loading" onLoadingComplete={handleLoadingComplete} />
      </StaggeredCurtainReveal>
    </>
  )
}
