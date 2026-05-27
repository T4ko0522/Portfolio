"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, type AnimationDefinition } from "framer-motion"
import { cn } from "../lib/utils"
import { getDaysUntilBirthday } from "../lib/utils"
import {
  sectionBackgrounds,
  projectDetails,
  pageVariants,
  pageTransition,
  BIRTH_MONTH,
  BIRTH_DAY,
  TOTAL_PAGES,
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
import WorksSection from "./works-section"
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

const MobileContact = dynamic<{
  onCopyDiscord: () => void
  discordCopied: boolean
}>(() => import("./mobile/contact"), {
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

  // framer-motion の enter→center 完了でセクション遷移ロックを解除する
  const handlePageAnimationComplete = (definition: AnimationDefinition) => {
    if (definition === "center") {
      isTransitioningRef.current = false
    }
  }

  // Contact セクションのページ離脱は累積閾値で判定して感度を緩める
  const contactWheelAccumRef = useRef(0)
  const contactWheelResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const CONTACT_WHEEL_THRESHOLD_DOWN = 250 // contact → 次（実質なし、保険）
  const CONTACT_WHEEL_THRESHOLD_UP = 250 // contact → works（戻る方向の猶予を多めに）
  const NOSCROLL_WHEEL_THRESHOLD = 600 // 内部スクロール領域がない時の遷移閾値（例: about のカウントダウン非表示時）
  const CONTACT_WHEEL_RESET_MS = 220

  // セクション内スクロールのプログレス更新（スクロール位置に比例）
  const computeScrollProgress = (el: HTMLElement) => {
    const max = el.scrollHeight - el.clientHeight
    return max > 0 ? Math.max(0, Math.min(1, el.scrollTop / max)) : 0
  }

  const handleSectionScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollProgress(computeScrollProgress(e.currentTarget))
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

      const max = sec.scrollHeight - sec.clientHeight
      const noScroll = max <= 0
      const atTop = sec.scrollTop <= 0
      const atBottom = sec.scrollTop + sec.clientHeight >= sec.scrollHeight - 1

      const tryMove = (delta: number, dir: 1 | -1) => {
        e.preventDefault()
        contactWheelAccumRef.current += delta
        if (contactWheelResetTimerRef.current) clearTimeout(contactWheelResetTimerRef.current)
        contactWheelResetTimerRef.current = setTimeout(() => {
          contactWheelAccumRef.current = 0
        }, CONTACT_WHEEL_RESET_MS)
        const baseThreshold = dir === 1 ? CONTACT_WHEEL_THRESHOLD_DOWN : CONTACT_WHEEL_THRESHOLD_UP
        const threshold = noScroll ? NOSCROLL_WHEEL_THRESHOLD : baseThreshold
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
      setScrollProgress(computeScrollProgress(sec))
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

  // Spotify ステータス: Durable Object + WebSocket を主とし、失敗時は短い polling にフォールバック
  useEffect(() => {
    let cancelled = false
    let socket: WebSocket | null = null
    let pollAbortController: AbortController | null = null
    let pollIntervalId: ReturnType<typeof setInterval> | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let wsAttempt = 0
    let openedOnce = false

    const applyData = (data: SpotifyApiResponse) => {
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

    const stopPolling = () => {
      pollAbortController?.abort()
      pollAbortController = null
      if (pollIntervalId !== null) {
        clearInterval(pollIntervalId)
        pollIntervalId = null
      }
    }

    const fetchOnce = async () => {
      pollAbortController?.abort()
      pollAbortController = new AbortController()
      try {
        const res = await fetch('/api/v1/spotify-status', {
          signal: pollAbortController.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: SpotifyApiResponse = await res.json()
        if (cancelled) return
        if (data.error) {
          console.error('Spotify status error:', data.error)
        } else {
          applyData(data)
        }
      } catch (error) {
        if (cancelled) return
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Error fetching spotify status:', error)
      } finally {
        if (!cancelled) setIsSpotifyLoading(false)
      }
    }

    const startPolling = () => {
      if (pollIntervalId !== null) return
      fetchOnce()
      pollIntervalId = setInterval(fetchOnce, 5000)
    }

    const connectWebSocket = () => {
      if (cancelled) return
      if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
        startPolling()
        return
      }

      // 初回接続前に最新の state を 1 度取得しておく (WS 接続成功までの空白を避ける)
      if (!openedOnce) fetchOnce()

      const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const wsUrl = `${scheme}://${window.location.host}/api/v1/spotify-status/ws`
      let didOpen = false

      try {
        socket = new WebSocket(wsUrl)
      } catch (error) {
        console.warn('WebSocket constructor failed, falling back to polling:', error)
        startPolling()
        return
      }

      socket.onopen = () => {
        didOpen = true
        openedOnce = true
        wsAttempt = 0
        stopPolling()
      }

      socket.onmessage = (event) => {
        try {
          const data: SpotifyApiResponse = JSON.parse(event.data)
          if (cancelled) return
          if (data.error) {
            console.error('Spotify status error:', data.error)
          } else {
            applyData(data)
          }
        } catch (error) {
          console.error('Failed to parse WS payload:', error)
        } finally {
          if (!cancelled) setIsSpotifyLoading(false)
        }
      }

      const handleDisconnect = () => {
        socket = null
        if (cancelled) return

        if (!didOpen && !openedOnce) {
          // 一度も開けなかった = WS 非対応環境 (`pnpm dev` など) と判断して polling に切替え
          wsAttempt++
          if (wsAttempt >= 2) {
            startPolling()
            return
          }
        }

        // 接続中の途切れは指数バックオフで再接続を試みる (最大 30s)
        const delay = Math.min(30_000, 1_000 * 2 ** Math.min(wsAttempt, 5))
        wsAttempt++
        startPolling() // 切断中の空白を埋めるため一時的に polling を回す
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null
          stopPolling()
          connectWebSocket()
        }, delay)
      }

      socket.onerror = () => {
        // close が続けて発火するため、ここでは何もしない
      }
      socket.onclose = handleDisconnect
    }

    setIsSpotifyLoading(true)
    connectWebSocket()

    return () => {
      cancelled = true
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      stopPolling()
      if (socket) {
        try {
          socket.onopen = null
          socket.onmessage = null
          socket.onerror = null
          socket.onclose = null
          socket.close()
        } catch {
          // already closed
        }
        socket = null
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
      {/* Discord デコレーション (unoptimized で実描画と URL が一致するため preload が効く) */}
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
      {/* ページコンテナ（固定・ピン留め） */}
      <div className="fixed inset-0 overflow-hidden bg-black">
        {/* main 背景画像を常駐させ、再マウントによる初回ロードフラッシュを防ぐ。
            home 以外では opacity 0 にして他セクションの背景に透けないようにする。 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none transition-opacity duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            filter: sectionBackgrounds[0].filter || "none",
            transform: "scale(1.3) translateZ(0px)",
            opacity: currentPage === 0 ? 1 : 0,
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
              onAnimationComplete={handlePageAnimationComplete}
            >
              <div
                ref={(el) => {
                  if (el) sectionScrollRefs.current.set(0, el)
                  else sectionScrollRefs.current.delete(0)
                }}
                onScroll={handleSectionScroll}
                className="relative z-10 w-full h-full overflow-y-auto"
              >
                <MainSection pacificoClassName={pacificoClassName} isMobile={isMobile} />
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
              onAnimationComplete={handlePageAnimationComplete}
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
                ref={(el) => {
                  if (el) sectionScrollRefs.current.set(1, el)
                  else sectionScrollRefs.current.delete(1)
                }}
                onScroll={handleSectionScroll}
                className="relative z-10 w-full h-full overflow-y-auto"
              >
                <AboutSection
                  isMobile={isMobile}
                  daysUntilBirthday={daysUntilBirthday}
                  discordStatus={discordStatus}
                  spotifyTrack={spotifyTrack}
                  isSpotifyLoading={isSpotifyLoading}
                />
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
              onAnimationComplete={handlePageAnimationComplete}
            >
              <DottedSurface className="absolute inset-0" speed={0.02}>
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
                ref={(el) => {
                  if (el) sectionScrollRefs.current.set(2, el)
                  else sectionScrollRefs.current.delete(2)
                }}
                onScroll={(e) => {
                  const el = e.currentTarget
                  setScrollProgress(computeScrollProgress(el))
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
                <WorksSection
                  isMobile={isMobile}
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
                  worksSteps={worksSteps}
                  worksPadding={WORKS_PADDING}
                />
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
              onAnimationComplete={handlePageAnimationComplete}
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
                ref={(el) => {
                  if (el) sectionScrollRefs.current.set(3, el)
                  else sectionScrollRefs.current.delete(3)
                }}
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
                animate={{ y: [0, 6, 0] }}
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
                  <path d="M12 5v14M5 12l7 7 7-7" />
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
                    style={{ width: `${scrollProgress * 100}%` }}
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
                    style={{ width: `${scrollProgress * 100}%` }}
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
