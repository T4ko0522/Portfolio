"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import {
  Calendar,
  Gift,
  Code,
} from "lucide-react"
import { Card, CardContent } from "@/card"
import { cn } from "../lib/utils"
import { getDaysUntilBirthday } from "../lib/utils"
import {
  introTexts,
  sectionBackgrounds,
  projectDetails,
  pageVariants,
  pageTransition,
  containerVariants,
  itemVariants,
  BIRTH_MONTH,
  BIRTH_DAY,
  TOTAL_PAGES,
} from "../lib/constants"
import type { SpotifyTrack, SpotifyApiResponse } from "../types/spotify"
import LoadingScreen from "./loading-screen"
import TypingAnimation from "./typing-animation"
import { useIsMobile } from "../hooks/use-mobile"
import Image from "next/image"
import type { ProjectDetail } from "../types/project"
import StaggeredCurtainReveal from "./staggered-curtain-reveal"
import Header from "./header"
import SpotifyNowPlaying from "./spotify-now-playing"
import ContactSection from "./contact-section"
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

const MobileTypingAnimation = dynamic<{
  texts: string[]
  className?: string
}>(() => import("./mobile-typing-animation"), {
  ssr: false,
})

const MobileTitle = dynamic(() => import("./mobile-title"), {
  ssr: false,
})

const MobileAbout = dynamic<{
  daysUntilBirthday: number
  discordStatus?: string | null
}>(() => import("./mobile-about"), {
  ssr: false,
})

const MobileWorks = dynamic<{
  projects: ProjectDetail[]
}>(() => import("./mobile-works"), {
  ssr: false,
})

const WorksCarousel = dynamic<{
  projects: ProjectDetail[]
  position: ReturnType<typeof useMotionValue<number>>
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  minIndex: number
  maxIndex: number
}>(() => import("./works-carousel"), {
  ssr: false,
})

const MobileContact = dynamic<{
  onCopyDiscord: () => void
  discordCopied: boolean
}>(() => import("./mobile-contact"), {
  ssr: false,
})

interface HomePageProps {
  pacificoClassName: string
  initialDaysUntilBirthday: number
}

export default function HomePage({ pacificoClassName, initialDaysUntilBirthday }: HomePageProps) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [daysUntilBirthday, setDaysUntilBirthday] = useState<number>(initialDaysUntilBirthday)
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null)
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false)
  const [discordStatus, setDiscordStatus] = useState<'online' | 'idle' | 'dnd' | 'offline' | null>(null)
  const [discordCopied, setDiscordCopied] = useState(false)

  // Works カルーセル用の状態
  const worksMinIndex = 0
  const worksMaxIndex = Math.max(0, projectDetails.length - 1)
  const worksSteps = worksMaxIndex - worksMinIndex
  const WORKS_PADDING = 0.4 // viewport 単位（最初/最後の猶予領域）
  const [worksActiveIndex, setWorksActiveIndex] = useState(worksMinIndex)
  const worksPosition = useMotionValue(0)

  // スクロール駆動アニメーション用のref
  const mainSectionRef = useRef<HTMLElement>(null)
  const aboutSectionRef = useRef<HTMLElement>(null)
  const worksSectionRef = useRef<HTMLElement>(null)
  const contactSectionRef = useRef<HTMLElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<1 | -1>(1)
  const [scrollProgress, setScrollProgress] = useState(0)

  // ページ遷移とセクション内スクロール用のref
  const skipTransitionRef = useRef(false)
  const isTransitioningRef = useRef(false)
  const sectionScrollRefs = useRef<Map<number, HTMLDivElement | null>>(new Map())
  const TRANSITION_DURATION = 800

  // Contact セクションのページ離脱は累積閾値で判定して感度を緩める
  const contactWheelAccumRef = useRef(0)
  const contactWheelResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const CONTACT_WHEEL_THRESHOLD_DOWN = 250 // contact → 次（実質なし、保険）
  const CONTACT_WHEEL_THRESHOLD_UP = 250 // contact → works（戻る方向の猶予を多めに）
  const CONTACT_WHEEL_RESET_MS = 220

  // セクション内スクロールのプログレス更新
  const handleSectionScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const max = el.scrollHeight - el.clientHeight
    setScrollProgress(max > 0 ? Math.max(0, Math.min(1, el.scrollTop / max)) : 0)
  }

  // ページ間移動
  const moveToPage = (target: number, direction: 1 | -1) => {
    if (isTransitioningRef.current) return
    if (target < 0 || target >= TOTAL_PAGES) return
    if (target === currentPage) return

    isTransitioningRef.current = true
    contactWheelAccumRef.current = 0
    if (contactWheelResetTimerRef.current) {
      clearTimeout(contactWheelResetTimerRef.current)
      contactWheelResetTimerRef.current = null
    }
    setScrollDirection(direction)
    setCurrentPage(target)
    setScrollProgress(0)

    setTimeout(() => {
      isTransitioningRef.current = false
    }, TRANSITION_DURATION)
  }

  useEffect(() => {
    const getActiveSectionEl = () => sectionScrollRefs.current.get(currentPage) ?? null

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioningRef.current) {
        e.preventDefault()
        return
      }

      const sec = getActiveSectionEl()
      if (!sec) {
        e.preventDefault()
        if (e.deltaY > 0) moveToPage(currentPage + 1, 1)
        else if (e.deltaY < 0) moveToPage(currentPage - 1, -1)
        return
      }

      const atTop = sec.scrollTop <= 0
      const atBottom = sec.scrollTop + sec.clientHeight >= sec.scrollHeight - 1

      const tryMove = (delta: number, dir: 1 | -1) => {
        e.preventDefault()
        contactWheelAccumRef.current += delta
        if (contactWheelResetTimerRef.current) clearTimeout(contactWheelResetTimerRef.current)
        contactWheelResetTimerRef.current = setTimeout(() => {
          contactWheelAccumRef.current = 0
        }, CONTACT_WHEEL_RESET_MS)
        const threshold = dir === 1 ? CONTACT_WHEEL_THRESHOLD_DOWN : CONTACT_WHEEL_THRESHOLD_UP
        if (
          (dir === 1 && contactWheelAccumRef.current >= threshold) ||
          (dir === -1 && contactWheelAccumRef.current <= -threshold)
        ) {
          contactWheelAccumRef.current = 0
          moveToPage(currentPage + dir, dir)
        }
      }

      if (e.deltaY > 0 && atBottom && currentPage < TOTAL_PAGES - 1) {
        tryMove(e.deltaY, 1)
      } else if (e.deltaY < 0 && atTop && currentPage > 0) {
        tryMove(e.deltaY, -1)
      } else {
        // 端に達していない時は内部スクロールなので累積をリセット
        contactWheelAccumRef.current = 0
      }
      // 端に達していない場合はブラウザ標準の内部スクロールに任せる
    }

    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current) return

      const sec = getActiveSectionEl()
      if (!sec) return

      const touchEndY = e.changedTouches[0].clientY
      const deltaY = touchStartY - touchEndY

      if (Math.abs(deltaY) < 50) return

      const atTop = sec.scrollTop <= 0
      const atBottom = sec.scrollTop + sec.clientHeight >= sec.scrollHeight - 1

      if (deltaY > 0 && atBottom && currentPage < TOTAL_PAGES - 1) {
        moveToPage(currentPage + 1, 1)
      } else if (deltaY < 0 && atTop && currentPage > 0) {
        moveToPage(currentPage - 1, -1)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current) return
      const sec = getActiveSectionEl()
      const atTop = sec ? sec.scrollTop <= 0 : true
      const atBottom = sec ? sec.scrollTop + sec.clientHeight >= sec.scrollHeight - 1 : true

      if ((e.key === "ArrowDown" || e.key === "PageDown") && atBottom && currentPage < TOTAL_PAGES - 1) {
        e.preventDefault()
        moveToPage(currentPage + 1, 1)
      } else if ((e.key === "ArrowUp" || e.key === "PageUp") && atTop && currentPage > 0) {
        e.preventDefault()
        moveToPage(currentPage - 1, -1)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // セクション移動時、進入方向に応じて新セクションのスクロール位置とインジケーターを同期
  useEffect(() => {
    let rafId = 0
    const sync = () => {
      const sec = sectionScrollRefs.current.get(currentPage)
      if (!sec) {
        // 新セクションがまだ mount されていない場合は次フレームで再試行
        rafId = requestAnimationFrame(sync)
        return
      }
      const max = sec.scrollHeight - sec.clientHeight
      // 戻り方向で進入した場合は末尾（その方向の継続感）、進み方向は先頭から
      sec.scrollTop = scrollDirection === -1 && max > 0 ? max : 0
      setScrollProgress(max > 0 ? Math.max(0, Math.min(1, sec.scrollTop / max)) : 0)
    }
    rafId = requestAnimationFrame(sync)
    return () => cancelAnimationFrame(rafId)
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // works セクションに入ったときに方向に応じてスクロール位置を初期化
  useEffect(() => {
    if (currentPage !== 2 || isMobile) return
    const sec = sectionScrollRefs.current.get(2)
    if (!sec) return
    const padPx = WORKS_PADDING * sec.clientHeight
    const targetTop =
      scrollDirection === -1
        ? padPx + worksSteps * sec.clientHeight
        : padPx
    sec.scrollTop = targetTop
    const idx = scrollDirection === -1 ? worksMaxIndex : worksMinIndex
    setWorksActiveIndex(idx)
    worksPosition.set(idx - worksMinIndex)
  }, [currentPage, scrollDirection, isMobile, worksMinIndex, worksMaxIndex, worksSteps, worksPosition])

  // クライアントサイドレンダリングのためのマウント確認と年齢・カウントダウン計算
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

  // Spotifyデータを取得（SSE使用）
  useEffect(() => {
    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null

    const connectSSE = () => {
      try {
        setIsSpotifyLoading(true)
        eventSource = new EventSource('/api/v1/spotify-status')

        eventSource.onmessage = (event) => {
          try {
            const data: SpotifyApiResponse = JSON.parse(event.data)

            if (data.error) {
              console.error('SSE error:', data.error)
              setIsSpotifyLoading(false)
              return
            }

            const spotifyActivity = data.discord?.activities?.find(
              (activity) => activity.name === 'Spotify'
            )

            if (spotifyActivity) {
              const startTime = spotifyActivity.timestamps?.start || 0
              const endTime = spotifyActivity.timestamps?.end || 0
              const now = Date.now()
              const currentPosition = Math.max(0, now - startTime)
              const duration = endTime > startTime ? endTime - startTime : 0

              setSpotifyTrack({
                name: spotifyActivity.details || '',
                artist: spotifyActivity.state || '',
                album: spotifyActivity.assets?.largeText || '',
                albumArtUrl: spotifyActivity.assets?.largeImage || '',
                isPlaying: true,
                currentTime: Math.floor(currentPosition / 1000),
                duration: Math.floor(duration / 1000),
              })
            } else {
              if (data.spotify && data.spotify.isPlaying) {
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
            }

            if (data.discord) {
              setDiscordStatus(data.discord.status)
            }

            setIsSpotifyLoading(false)
          } catch (error) {
            console.error('Error parsing SSE data:', error)
            setIsSpotifyLoading(false)
          }
        }

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error)
          setIsSpotifyLoading(false)

          if (eventSource) {
            eventSource.close()
            eventSource = null
          }

          reconnectTimeout = setTimeout(() => {
            connectSSE()
          }, 3000)
        }
      } catch (error) {
        console.error('Error setting up SSE:', error)
        setIsSpotifyLoading(false)

        reconnectTimeout = setTimeout(() => {
          connectSSE()
        }, 3000)
      }
    }

    connectSSE()

    return () => {
      if (eventSource) {
        eventSource.close()
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
    }
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

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

  const navigateToSection = (sectionId: string) => {
    const sections = [
      { id: "main", index: 0 },
      { id: "about", index: 1 },
      { id: "works", index: 2 },
      { id: "contact", index: 3 },
    ]

    const section = sections.find(s => s.id === sectionId)
    if (!section || section.index === currentPage) return

    const targetPage = section.index
    const direction: 1 | -1 = targetPage > currentPage ? 1 : -1

    // アニメーションをスキップして即座に遷移
    skipTransitionRef.current = true
    isTransitioningRef.current = true

    setScrollDirection(direction)
    setCurrentPage(targetPage)
    setScrollProgress(0)

    requestAnimationFrame(() => {
      skipTransitionRef.current = false
      isTransitioningRef.current = false
      const newSec = sectionScrollRefs.current.get(targetPage)
      if (newSec) newSec.scrollTop = 0
    })
  }

  if (!mounted) return null

  return (
    <>
      {/* 優先読み込み用の非表示画像 */}
      <div className="hidden">
        <Image
          src="https://avatars.githubusercontent.com/u/108514947?v="
          alt=""
          width={128}
          height={128}
          priority
        />
        <Image
          src="/images/Background1.png"
          alt=""
          width={1920}
          height={1080}
          priority
        />
        <Image
          src="https://cdn.discordapp.com/avatar-decoration-presets/a_8552f9857793aed0cf816f370e2df3be.png?size=96&passthrough=true"
          alt=""
          width={128}
          height={128}
          priority
          unoptimized
        />
      </div>
      {/* ページコンテナ（固定・ピン留め） */}
      <div className="fixed inset-0 overflow-hidden bg-black">
        <AnimatePresence mode="sync" custom={scrollDirection}>
          {/* メインセクション（ページ0） */}
          {currentPage === 0 && (
            <motion.section
              key="main"
              ref={mainSectionRef}
              id="main"
              className="absolute inset-0 w-screen h-screen pointer-events-auto"
              custom={scrollDirection}
              variants={pageVariants}
              initial={skipTransitionRef.current ? false : "enter"}
              animate="center"
              exit="exit"
              transition={skipTransitionRef.current ? { duration: 0 } : pageTransition}
            >
              {/* 背景画像 */}
              <div
                className="absolute inset-0 w-full h-full overflow-hidden -z-1"
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
              <div
                ref={(el) => { sectionScrollRefs.current.set(0, el) }}
                onScroll={handleSectionScroll}
                className="relative z-10 w-full h-full overflow-y-auto"
              >
                <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center pt-32 pb-16">
                {/* タイトル */}
              <div className="w-full text-center mb-20 px-4">
                <motion.div
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.15 }}
                  className={`${pacificoClassName} ${isMobile ? "text-4xl" : "text-6xl md:text-7xl lg:text-8xl"} font-bold mb-10 flex items-center justify-center gap-4`}
                >
                  <Image
                    src="https://raw.githubusercontent.com/ABSphreak/ABSphreak/master/gifs/Hi.gif"
                    alt="Hi"
                    width={80}
                    height={80}
                    className={isMobile ? "w-12 h-12" : "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 inline-block"}
                    unoptimized
                  />
                  <span className="text-white">Hi there!</span>
                </motion.div>
                <MobileTitle />
              </div>

              <div className="container mx-auto px-4 max-w-4xl text-center">
              </div>

              {/* タイピングアニメーション（introText） */}
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.3 }}
                className="w-full mt-25 flex justify-center items-center px-4"
              >
                {isMobile ? (
                  <MobileTypingAnimation
                    texts={introTexts}
                    className={`${pacificoClassName} text-xl sm:text-4xl md:text-5xl lg:text-6xl`}
                  />
                ) : (
                  <TypingAnimation
                    texts={introTexts}
                    className={`${pacificoClassName} text-4xl md:text-5xl lg:text-6xl`}
                  />
                )}
              </motion.div>

              {/* SNSリンク */}
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.5 }}
                className="flex justify-center space-x-6 mb-16 pointer-events-auto"
              >
                <motion.a
                  href="https://github.com/T4ko0522"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative p-4 rounded-full bg-transparent"
                  aria-label="GitHub"
                  whileHover={{ scale: 1.3, rotate: 7 }}
                >
                  <svg
                    className="w-10 h-10 text-white relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </motion.a>

                <motion.a
                  href="https://www.youtube.com/@%E3%82%BF%E3%82%B3%E3%81%95%E3%82%93%E3%81%A7%E3%81%99"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative p-4 rounded-full bg-transparent"
                  aria-label="YouTube"
                  whileHover={{ scale: 1.3, rotate: 7 }}
                >
                  <svg
                    className="w-10 h-10 text-white relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </motion.a>

                <motion.a
                  href="https://x.com/T4ko0522"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative p-4 rounded-full bg-transparent"
                  aria-label="Twitter"
                  whileHover={{ scale: 1.3, rotate: 7 }}
                >
                  <svg
                    className="w-10 h-10 text-white relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  </motion.a>
                </motion.div>
                </div>
                <div aria-hidden="true" className="w-full h-[80vh] pointer-events-none" />
              </div>
            </motion.section>
          )}

          {/* About Me セクション（ページ1） */}
          {currentPage === 1 && (
            <motion.section
              key="about"
              ref={aboutSectionRef}
              id="about"
              className="absolute inset-0 w-screen h-screen overflow-hidden pointer-events-auto"
              custom={scrollDirection}
              variants={pageVariants}
              initial={skipTransitionRef.current ? false : "enter"}
              animate="center"
              exit="exit"
              transition={skipTransitionRef.current ? { duration: 0 } : pageTransition}
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
                ref={(el) => { sectionScrollRefs.current.set(1, el) }}
                onScroll={handleSectionScroll}
                className="relative z-10 w-full h-full overflow-y-auto"
              >
                <div className="sticky top-0 h-screen container mx-auto px-4 max-w-6xl flex items-center justify-center py-16">
                {isMobile ? (
                  <MobileAbout daysUntilBirthday={daysUntilBirthday} discordStatus={discordStatus} />
                ) : (
                  <div className="flex flex-row items-center gap-8 lg:gap-12 w-full">
                    {/* 左側: アイコン */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.1 }}
                      className="flex-shrink-0 flex flex-col items-center"
                    >
                      <div className="relative w-[300px] h-[240px] lg:w-[400px] lg:h-[320px] flex items-center justify-center">
                        <Image
                          src="https://cdn.discordapp.com/avatar-decoration-presets/a_48b8411feb1e80a69048fc65b3275b75.png?size=256&passthrough=true"
                          alt="Decoration"
                          width={256}
                          height={256}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                          style={{ width: '248px', height: '248px' }}
                          draggable="false"
                          unoptimized
                        />
                        {discordStatus && (
                          <div
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 lg:w-64 lg:h-64 pointer-events-none z-[60]"
                            aria-hidden
                          >
                            <div className="absolute bottom-0 right-2" style={{ width: '28px', height: '28px', filter: 'drop-shadow(0 0 0 3px #1a1a1a)' }}>
                              {discordStatus === 'online' ? (
                                <svg width="28" height="28" viewBox="0 0 12 12" className="w-full h-full">
                                  <circle cx="6" cy="6" r="6" fill="rgb(69, 163, 102)" />
                                </svg>
                              ) : discordStatus === 'idle' ? (
                                <svg width="28" height="28" viewBox="2 2 20 20" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 17C10.952 18.6176 16.6829 8.75775 11 3C16.0007 3.13144 20 7.11149 20 12C20 16.9715 16.1188 21 11 21C7.77111 21 4.65938 19.4319 3 17Z" fill="#ffc04e" stroke="#ffc04e" strokeWidth="1.5" strokeLinejoin="round" />
                                </svg>
                              ) : discordStatus === 'dnd' ? (
                                <svg width="28" height="28" viewBox="0 0 12 12" className="w-full h-full">
                                  <circle cx="6" cy="6" r="6" fill="rgb(237, 66, 69)" />
                                  <rect x="2" y="5" width="8" height="2" fill="black" rx="1" />
                                </svg>
                              ) : (
                                <svg width="28" height="28" viewBox="0 0 12 12" className="w-full h-full">
                                  <circle cx="6" cy="6" r="6" fill="rgb(116, 127, 141)" />
                                  <circle cx="6" cy="6" r="4" fill="rgb(79, 84, 92)" />
                                </svg>
                              )}
                            </div>
                          </div>
                        )}
                        <motion.div
                          className="w-52 h-52 lg:w-64 lg:h-64 rounded-full overflow-visible relative z-40"
                        >
                          <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image
                              src="https://avatars.githubusercontent.com/u/108514947?v="
                              alt="Tako"
                              fill
                              sizes="(max-width: 1024px) 208px, 256px"
                              className="object-cover"
                            />
                          </div>
                        </motion.div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-6 text-center"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <h2 className="text-4xl lg:text-5xl font-bold text-white" style={{ fontFamily: 'Discord, sans-serif' }}>T4ko</h2>
                          <div className="flex items-center gap-1.5 border border-white/30 rounded px-2 py-0.5">
                            <Image
                              src="https://cdn.discordapp.com/clan-badges/1399359679473254492/df39482e5db7ebbeff7f6d9a832a6144.png?size=16"
                              alt="Clan Badge"
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                            <span className="text-xs lg:text-sm font-bold text-white">OP81</span>
                          </div>
                        </div>
                        <p className="text-base lg:text-lg text-gray-300 mb-1">tako._.v<span className="font-bold">・</span>17yo He/Him</p>
                      </motion.div>
                      <SpotifyNowPlaying track={spotifyTrack || undefined} isLoading={isSpotifyLoading} />
                    </motion.div>

                    {/* 右側: About Me */}
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
                      className="flex-1"
                    >
                      <Card className="bg-transparent border-transparent">
                        <CardContent className="p-6">
                          <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-cyan-300">💻 About Me</h3>
                          <p className="mb-4 text-white text-lg">
                            <span className="font-bold">Full-Stack Engineer | Software Developer</span>
                          </p>
                          <p className="mb-6 text-white">
                            2008年大阪生まれ。現在はWeb開発を中心に学習しており、バックエンドとフロントエンドの両方を扱えるフルスタックエンジニアです！2025年10月からmuclaseという会社でエンジニアとしてインターンで働いております！
                            <br />
                            <span className="block text-sm italic text-gray-200 mt-2">
                              Born in Osaka in 2008. Currently studying web development and is a full-stack engineer capable of both back-end and front-end development. Starting in October 2025, I have been working as an intern at a company called muclase!
                            </span>
                          </p>
                          <div className="grid grid-cols-1 gap-4">
                            {/* 誕生日 */}
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="bg-transparent backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300 rounded-2xl p-5 shadow-lg text-white"
                            >
                              <div className="flex items-center mb-2">
                                <Gift className="w-5 h-5 text-white mr-2" />
                                <h4 className="text-lg font-medium text-white">Birthday</h4>
                              </div>
                              <div className="flex items-baseline">
                                <span className="text-xl font-bold text-gray-200">May 22nd</span>
                                {daysUntilBirthday > 0 && (
                                  <span className="ml-2 text-sm text-gray-200">({daysUntilBirthday} days left)</span>
                                )}
                                {daysUntilBirthday === 0 && (
                                  <span className="ml-2 text-sm text-green-400 font-bold animate-pulse">Today! 🎉</span>
                                )}
                              </div>
                            </motion.div>
                            {/* Skills */}
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="bg-transparent backdrop-blur-sm border border-white/10 hover:border-cyan-500/50 transition-all duration-300 rounded-2xl p-5 shadow-lg text-white"
                            >
                              <div className="flex items-center mb-4">
                                <Code className="w-5 h-5 text-white mr-2" />
                                <h4 className="text-lg font-medium text-white">Skills</h4>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <img
                                  src="https://skillicons.dev/icons?i=js,ts,go,python,lua,bash,powershell"
                                  alt="Languages"
                                  className="h-auto"
                                />
                                <img
                                  src="https://skillicons.dev/icons?i=react,vue,astro,next,nuxt,remix,tailwind,materialui,express,nest,vite,vitest,nodejs,deno,electron"
                                  alt="Frameworks"
                                  className="h-auto"
                                />
                                <img
                                  src="https://skillicons.dev/icons?i=linux,gcp,vercel,docker,kubernetes,postgres,mysql"
                                  alt="Infrastructure"
                                  className="h-auto"
                                />
                              </div>
                            </motion.div>
                          </div>

                          {/* 誕生日カウントダウン */}
                          {daysUntilBirthday <= 30 && daysUntilBirthday > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 rounded-lg mt-4 border border-purple-500/30"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Calendar className="w-5 h-5 text-purple-400 mr-2" />
                                  <h4 className="font-medium text-purple-300">Birthday Countdown</h4>
                                </div>
                                <div className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                                  {daysUntilBirthday} {daysUntilBirthday === 1 ? "day" : "days"}
                                </div>
                              </div>
                              <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                                <motion.div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${100 - (daysUntilBirthday / 30) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                              </div>
                            </motion.div>
                          )}

                          {/* 誕生日アニメーション */}
                          {daysUntilBirthday === 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="relative bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-6 rounded-lg mt-4 border border-pink-500/50 overflow-hidden"
                            >
                              <h4 className="text-xl font-bold text-center mb-2 text-white">🎉 Happy Birthday! 🎂</h4>
                              <p className="text-center text-gray-300 mb-4">May all your wishes come true!</p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                )}
                </div>
                <div aria-hidden="true" className="w-full h-[80vh] pointer-events-none" />
              </div>
            </motion.section>
          )}

          {/* Works セクション（ページ2） */}
          {currentPage === 2 && (
            <motion.section
              key="works"
              ref={worksSectionRef}
              id="works"
              className="absolute inset-0 w-screen h-screen pointer-events-auto"
              custom={scrollDirection}
              variants={pageVariants}
              initial={skipTransitionRef.current ? false : "enter"}
              animate="center"
              exit="exit"
              transition={skipTransitionRef.current ? { duration: 0 } : pageTransition}
            >
              <DottedSurface className="absolute inset-0" speed={0.02} >
                <div
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full',
                    'bg-[radial-gradient(ellipse_at_center,hsl(var(--foreground)/0.1),transparent_50%)]',
                    'blur-[30px]',
                  )}
                />
              </DottedSurface>
              <div
                ref={(el) => { sectionScrollRefs.current.set(2, el) }}
                onScroll={(e) => {
                  const el = e.currentTarget
                  const max = el.scrollHeight - el.clientHeight
                  setScrollProgress(max > 0 ? Math.max(0, Math.min(1, el.scrollTop / max)) : 0)
                  if (!isMobile && el.clientHeight > 0) {
                    const padPx = WORKS_PADDING * el.clientHeight
                    const effective = el.scrollTop - padPx
                    const rawPos = effective / el.clientHeight
                    const clamped = Math.max(0, Math.min(worksSteps, rawPos))
                    worksPosition.set(clamped)
                    const next = worksMinIndex + Math.round(clamped)
                    setWorksActiveIndex((prev) => (prev === next ? prev : next))
                  }
                }}
                className="relative z-10 w-full h-full overflow-y-auto"
              >
                {isMobile ? (
                  <div className="min-h-full w-full flex items-center justify-center py-16">
                    <MobileWorks projects={projectDetails} />
                  </div>
                ) : (
                  <div
                    className="relative w-full"
                    style={{ height: `${(worksSteps + 1 + 2 * WORKS_PADDING) * 100}vh` }}
                  >
                    <div className="sticky top-0 h-screen w-full flex items-center justify-center">
                      <WorksCarousel
                        projects={projectDetails}
                        position={worksPosition}
                        activeIndex={worksActiveIndex}
                        onActiveIndexChange={(idx) => {
                          setWorksActiveIndex(idx)
                          const sec = sectionScrollRefs.current.get(2)
                          if (sec && sec.clientHeight > 0) {
                            const padPx = WORKS_PADDING * sec.clientHeight
                            sec.scrollTo({
                              top: padPx + (idx - worksMinIndex) * sec.clientHeight,
                              behavior: "smooth",
                            })
                          }
                        }}
                        minIndex={worksMinIndex}
                        maxIndex={worksMaxIndex}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* Contact セクション（ページ3） */}
          {currentPage === 3 && (
            <motion.section
              key="contact"
              ref={contactSectionRef}
              id="contact"
              className="absolute inset-0 w-screen h-screen pointer-events-auto"
              custom={scrollDirection}
              variants={pageVariants}
              initial={skipTransitionRef.current ? false : "enter"}
              animate="center"
              exit="exit"
              transition={skipTransitionRef.current ? { duration: 0 } : pageTransition}
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
                ref={(el) => { sectionScrollRefs.current.set(3, el) }}
                onScroll={handleSectionScroll}
                className="relative z-10 w-full h-full overflow-y-auto"
              >
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
            </motion.section>
          )}
        </AnimatePresence>

        {/* 固定ナビゲーションヘッダー */}
        <Header onNavigate={navigateToSection} />

        {/* スクロール進行状況インジケーター（下部） */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          {currentPage === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-row items-center gap-2 mb-3 justify-center"
            >
              <span className="text-white/80 text-sm font-medium">
                Scroll down to explore
              </span>
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
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
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.div>
            </motion.div>
          )}
          <div className="flex flex-row flex-nowrap items-center gap-3 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
            {currentPage === 3 ? (
              <>
                <span className="text-sm font-medium text-white/60">Works</span>
                <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    style={{
                      width: `${scrollProgress * 100}%`,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-sm font-medium text-white">Contact</span>
              </>
            ) : (
              <>
                <span className="text-white text-sm font-medium">
                  {currentPage === 0 && "Home"}
                  {currentPage === 1 && "About"}
                  {currentPage === 2 && "Works"}
                </span>
                <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    style={{
                      width: `${scrollProgress * 100}%`,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-white/60 text-sm">
                  {currentPage === 0 && "About"}
                  {currentPage === 1 && "Works"}
                  {currentPage === 2 && "Contact"}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ローディング画面 */}
      <StaggeredCurtainReveal isVisible={isLoading}>
        <LoadingScreen key="loading" onLoadingComplete={handleLoadingComplete} />
      </StaggeredCurtainReveal>
    </>
  )
}
