"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ExternalLink,
  Calendar,
  Gift,
  Code,
  Mail,
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
import ProjectDetailModal, { type ProjectDetail } from "./project-detail-modal"
import StaggeredCurtainReveal from "./staggered-curtain-reveal"
import Header from "./header"
import SpotifyNowPlaying from "./spotify-now-playing"
import { BgShader } from "./bg-shader"
import { DottedSurface } from "./dotted-surface"
import { ShootingStars } from "./shooting-stars"
import dynamic from "next/dynamic"

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
  onProjectClick: (project: ProjectDetail) => void
  currentProjectIndex: number
  onProjectIndexChange: (index: number) => void
  containerCenterY?: number
}>(() => import("./mobile-works"), {
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
  const [selectedProject, setSelectedProject] = useState<ProjectDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null)
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false)
  const [discordStatus, setDiscordStatus] = useState<'online' | 'idle' | 'dnd' | 'offline' | null>(null)
  const [discordCopied, setDiscordCopied] = useState(false)

  // スクロール駆動アニメーション用のref
  const mainSectionRef = useRef<HTMLElement>(null)
  const aboutSectionRef = useRef<HTMLElement>(null)
  const worksSectionRef = useRef<HTMLElement>(null)
  const contactSectionRef = useRef<HTMLElement>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<1 | -1>(1)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Works セクション用の状態
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  const lastWheelTime = useRef(0)
  const previousPage = useRef(0)
  const worksScrollProgress = useRef(0)
  const [worksProjectProgress, setWorksProjectProgress] = useState(0)
  const [worksContainerCenterY, setWorksContainerCenterY] = useState(0)
  useEffect(() => {
    if (!mounted) return
    const update = () => setWorksContainerCenterY(window.innerHeight * 0.45)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [mounted])

  // スクロール位置とページ状態を追跡するref
  const lastScrollY = useRef(0)
  const lastPage = useRef(0)
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSnappingRef = useRef(false)
  const skipTransitionRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (isSnappingRef.current) {
        return
      }

      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const scrollPerPage = windowHeight * 0.8

      const calculatedPage = Math.min(
        Math.floor(scrollY / scrollPerPage),
        TOTAL_PAGES - 1
      )

      const currentPageStart = calculatedPage * scrollPerPage
      const currentPageEnd = Math.min((calculatedPage + 1) * scrollPerPage, TOTAL_PAGES * scrollPerPage)
      const progressInPage = Math.max(0, Math.min(1, (scrollY - currentPageStart) / (currentPageEnd - currentPageStart)))
      setScrollProgress(progressInPage)

      if (calculatedPage !== lastPage.current) {
        const prevPage = lastPage.current
        const direction: 1 | -1 = calculatedPage > prevPage ? 1 : -1

        setScrollDirection(direction)
        setCurrentPage(calculatedPage)

        if (calculatedPage === 2) {
          setCurrentProjectIndex(direction === 1 ? 0 : 4)
          worksScrollProgress.current = 0
          setWorksProjectProgress(0)
        }
        previousPage.current = prevPage

        lastPage.current = calculatedPage
        lastScrollY.current = scrollY
      } else {
        lastScrollY.current = scrollY
      }

      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current)
      }

      snapTimeoutRef.current = setTimeout(() => {
        const currentScrollY = window.scrollY
        const nearestPage = Math.round(currentScrollY / scrollPerPage)
        const targetScrollY = nearestPage * scrollPerPage

        if (Math.abs(currentScrollY - targetScrollY) > 50) {
          isSnappingRef.current = true
          window.scrollTo({
            top: targetScrollY,
            behavior: "smooth",
          })
          setTimeout(() => {
            isSnappingRef.current = false
          }, 600)
        }
      }, 150)
    }

    lastScrollY.current = window.scrollY
    lastPage.current = currentPage

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (snapTimeoutRef.current) {
        clearTimeout(snapTimeoutRef.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Works セクション内のスクロール制御
  useEffect(() => {
    if (currentPage !== 2) {
      worksScrollProgress.current = 0
      return
    }

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now()
      if (now - lastWheelTime.current < 50) {
        e.preventDefault()
        return
      }

      e.preventDefault()
      lastWheelTime.current = now

      const scrollThreshold = window.innerHeight * 0.2
      const scrollDelta = Math.abs(e.deltaY)

      if (e.deltaY > 0) {
        worksScrollProgress.current += scrollDelta

        const progress = Math.min(worksScrollProgress.current / scrollThreshold, 1)
        setWorksProjectProgress(progress)

        if (worksScrollProgress.current >= scrollThreshold) {
          if (currentProjectIndex < 4) {
            setCurrentProjectIndex(prev => prev + 1)
            worksScrollProgress.current = 0
            setWorksProjectProgress(0)
          } else {
            worksScrollProgress.current = 0
            setWorksProjectProgress(0)
            const windowHeight = window.innerHeight
            const targetScrollY = 3 * windowHeight
            window.scrollTo({
              top: targetScrollY,
              behavior: "smooth",
            })
          }
        }
      } else {
        worksScrollProgress.current -= scrollDelta

        const progress = Math.max(worksScrollProgress.current / scrollThreshold, 0)
        setWorksProjectProgress(progress)

        if (worksScrollProgress.current <= -scrollThreshold) {
          if (currentProjectIndex > 0) {
            setCurrentProjectIndex(prev => prev - 1)
            worksScrollProgress.current = 0
            setWorksProjectProgress(0)
          } else {
            worksScrollProgress.current = 0
            setWorksProjectProgress(0)
            const windowHeight = window.innerHeight
            const targetScrollY = 1 * windowHeight
            window.scrollTo({
              top: targetScrollY,
              behavior: "smooth",
            })
          }
        }
      }

      worksScrollProgress.current = Math.max(-scrollThreshold, Math.min(scrollThreshold, worksScrollProgress.current))
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [currentPage, currentProjectIndex])

  // Works セクション内のキーボードナビゲーション
  useEffect(() => {
    if (currentPage !== 2) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' && currentProjectIndex < 4) {
        e.preventDefault()
        setCurrentProjectIndex(prev => prev + 1)
      } else if (e.key === 'ArrowUp' && currentProjectIndex > 0) {
        e.preventDefault()
        setCurrentProjectIndex(prev => prev - 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, currentProjectIndex])

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

    const midnightTimer = setTimeout(() => {
      updateCountdown()
      setInterval(updateCountdown, 24 * 60 * 60 * 1000)
    }, timeUntilMidnight)

    return () => {
      clearTimeout(midnightTimer)
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

  const handleProjectClick = (project: ProjectDetail) => {
    setSelectedProject(project)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProject(null)
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

    // Works セクションへの遷移時はプロジェクト状態をリセット
    if (targetPage === 2) {
      setCurrentProjectIndex(direction === 1 ? 0 : 4)
      worksScrollProgress.current = 0
      setWorksProjectProgress(0)
    }

    // アニメーションをスキップして即座に遷移
    skipTransitionRef.current = true
    isSnappingRef.current = true

    const scrollPerPage = window.innerHeight * 0.8
    const targetScrollY = targetPage * scrollPerPage
    window.scrollTo({ top: targetScrollY, behavior: "instant" })

    // state を直接更新して即座にページ遷移
    setScrollDirection(direction)
    setCurrentPage(targetPage)
    setScrollProgress(0)
    lastPage.current = targetPage
    lastScrollY.current = targetScrollY

    // 次フレームでロック解除
    requestAnimationFrame(() => {
      skipTransitionRef.current = false
      isSnappingRef.current = false
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
        />
      </div>
      {/* 縦スクロール可能な領域を確保（4ページ分のスクロール領域） */}
      <div style={{ height: `${TOTAL_PAGES * 100}vh` }} />

      {/* ページコンテナ（固定・ピン留め） */}
      <div className="fixed inset-0 overflow-hidden bg-black">
        <AnimatePresence mode="sync" custom={scrollDirection}>
          {/* メインセクション（ページ0） */}
          {currentPage === 0 && (
            <motion.section
              key="main"
              ref={mainSectionRef}
              id="main"
              className="absolute inset-0 w-screen h-screen flex flex-col items-center justify-center pt-32 pb-16 pointer-events-auto"
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
              <motion.div
                className="relative z-10 w-full h-full flex flex-col items-center justify-center"
              >
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
              </motion.div>
            </motion.section>
          )}

          {/* About Me セクション（ページ1） */}
          {currentPage === 1 && (
            <motion.section
              key="about"
              ref={aboutSectionRef}
              id="about"
              className="absolute inset-0 w-screen h-screen flex items-center justify-center overflow-hidden pointer-events-auto"
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
              <motion.div
                className="container mx-auto px-4 max-w-6xl w-full h-full relative z-10 flex items-center justify-center"
              >
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
                            <span className="font-bold">🎓CS Japanese Student | Full Stack Engineer</span>
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
                              <div className="flex justify-center">
                                <Image
                                  src="/images/skills.svg"
                                  alt="Skills"
                                  width={600}
                                  height={100}
                                  className="w-full h-auto"
                                  unoptimized
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
              </motion.div>
            </motion.section>
          )}

          {/* Works セクション（ページ2） */}
          {currentPage === 2 && (
            <motion.section
              key="works"
              ref={worksSectionRef}
              id="works"
              className="absolute inset-0 w-screen h-screen flex items-center justify-center pointer-events-auto"
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
              <motion.div
                className="container mx-auto px-4 max-w-4xl w-full relative z-10"
              >
                {isMobile ? (
                  <MobileWorks
                    projects={projectDetails}
                    onProjectClick={handleProjectClick}
                    currentProjectIndex={currentProjectIndex}
                    onProjectIndexChange={setCurrentProjectIndex}
                    containerCenterY={worksContainerCenterY}
                  />
                ) : (
                  <div className="relative w-full h-[90vh] overflow-hidden">
                    <motion.div
                      animate={{
                        y: (worksContainerCenterY || (typeof window !== "undefined" ? window.innerHeight * 0.45 : 0)) - 160 - currentProjectIndex * 180
                      }}
                      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                      className="flex flex-col items-center"
                      style={{ willChange: 'transform' }}
                    >
                      {projectDetails.map((project, index) => (
                        <motion.div
                          key={project.title}
                          animate={{
                            scale: currentProjectIndex === index ? 1.2 : 0.85,
                            opacity: currentProjectIndex === index ? 1.0 : 0.5,
                          }}
                          transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
                          onClick={(e) => {
                            const target = e.target as HTMLElement
                            if (target.closest('a')) {
                              return
                            }
                            handleProjectClick(project)
                          }}
                          className={cn(
                            "w-full max-w-2xl border rounded-lg p-6 cursor-pointer transition-all duration-300",
                            currentProjectIndex === index
                              ? "border-blue-500/50 shadow-2xl bg-gray-800/70"
                              : "border-gray-700/30 bg-gray-800/30"
                          )}
                          style={{ willChange: 'transform, opacity', minHeight: '160px' }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            {project.url ? (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                              >
                                <h4>{project.title}</h4>
                              </a>
                            ) : (
                              <h4 className="text-lg font-bold text-white">{project.title}</h4>
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
                                  <ExternalLink className="w-5 h-5" />
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
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">
                            {project.description}
                          </p>
                          {project.imageUrl && currentProjectIndex === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-2 rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center"
                            >
                              <Image
                                src={project.imageUrl}
                                alt={project.imageAlt}
                                width={600}
                                height={300}
                                className="w-full h-auto object-contain max-h-72"
                              />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.section>
          )}

          {/* Contact セクション（ページ3） */}
          {currentPage === 3 && (
            <motion.section
              key="contact"
              ref={contactSectionRef}
              id="contact"
              className="absolute inset-0 w-screen h-screen flex items-center justify-center pointer-events-auto"
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
                  starColor="#9E00FF"
                  trailColor="#2EB9DF"
                  minSpeed={15}
                  maxSpeed={35}
                  minDelay={1000}
                  maxDelay={3000}
                />
                <ShootingStars
                  starColor="#FF0099"
                  trailColor="#FFB800"
                  minSpeed={10}
                  maxSpeed={25}
                  minDelay={2000}
                  maxDelay={4000}
                />
                <ShootingStars
                  starColor="#00FF9E"
                  trailColor="#00B8FF"
                  minSpeed={20}
                  maxSpeed={40}
                  minDelay={1500}
                  maxDelay={3500}
                />
              </div>

              <motion.div
                className="container mx-auto px-4 max-w-4xl w-full relative z-10"
              >
                {isMobile ? (
                  <MobileContact onCopyDiscord={handleCopyDiscord} discordCopied={discordCopied} />
                ) : (
                  <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
                    <motion.div variants={itemVariants}>
                      <Card className="bg-transparent border-transparent">
                        <CardContent className="p-6">
                          <h3 className="text-3xl lg:text-4xl font-bold mb-8 text-white text-center">📧 Contact</h3>

                          <motion.div
                            variants={itemVariants}
                            className="mb-8"
                          >
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-1 items-center">
                              {/* Email */}
                              <div className="bg-transparent rounded-lg p-6">
                                <div className="flex flex-col items-center gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    <Mail className="w-6 h-6 text-cyan-400" />
                                    <h4 className="text-xl font-semibold text-white">Email</h4>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <a
                                    href="mailto:tako.work.contact@gmail.com"
                                    className="text-cyan-400 hover:text-cyan-300 text-lg font-mono transition-colors break-all"
                                  >
                                    tako.work.contact@gmail.com
                                  </a>
                                </div>
                              </div>

                              {/* or */}
                              <div className="flex items-center justify-center w-fit min-w-fit px-1">
                                <span className="text-white/60 text-lg font-medium whitespace-nowrap">or</span>
                              </div>

                              {/* Discord */}
                              <div className="bg-transparent rounded-lg p-6">
                                <div className="flex flex-col items-center gap-4 mb-4">
                                  <div className="flex items-center gap-3">
                                    <svg
                                      className="w-6 h-6 text-indigo-400"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.007-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                    </svg>
                                    <h4 className="text-xl font-semibold text-white">Discord</h4>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <motion.span
                                    onClick={handleCopyDiscord}
                                    className="text-indigo-400 hover:text-indigo-300 text-lg font-mono transition-colors break-all cursor-pointer"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {discordCopied ? "Copied!" : "tako._.v"}
                                  </motion.span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                          <motion.div
                            variants={itemVariants}
                            className="text-center"
                          >
                            <p className="text-gray-300 text-lg">
                              お気軽にご連絡ください！
                            </p>
                            <p className="text-gray-400 text-sm mt-2 italic">
                              Feel free to reach out!
                            </p>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>

              {/* フッター（Contactセクションのみ） */}
              {currentPage === 3 && (
                <motion.footer
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute bottom-20 left-0 right-0 py-6 text-center z-20"
                >
                  <div className="container mx-auto px-4">
                    <p className="text-gray-400 text-sm">
                      © {new Date().getFullYear()} T4ko0522. All rights reserved.
                    </p>
                  </div>
                </motion.footer>
              )}
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
            {currentPage === 2 ? (
              <>
                <span className="text-sm font-medium text-white">Works</span>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        currentProjectIndex === i ? "bg-white" : "bg-white/30"
                      )}
                      animate={{
                        scale: currentProjectIndex === i ? 1.2 : 1,
                        opacity: currentProjectIndex === i ? 1 : 0.3
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  ))}
                </div>
                <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    style={{
                      width: `${worksProjectProgress * 100}%`,
                    }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-white/60 text-sm">{currentProjectIndex + 1} / 5</span>
              </>
            ) : currentPage === 3 ? (
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
      {/* プロジェクト詳細モーダル */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
