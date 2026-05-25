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
  pageTransition,
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

const WORKS_PADDING = 0.4 // works セクションの前後余白 (viewport 単位)

const DWELL_SMALL = 20
const DWELL_FULL = 180
const WORKS_VH = (projectDetails.length + 2 * WORKS_PADDING) * 100

// 境界 hysteresis: 進捗 0.005 (~3.6vh) のデッドバンドを設けて、
// wheel 微振動で currentSection が flip しないようにする。
const HYSTERESIS = 0.005

// 遷移ロック時間 (pageTransition.duration の ms 換算)。
// 期間中は wheel/touch を preventDefault してマスター挙動の「カチッ」感を出す。
const TRANSITION_LOCK_MS = 600

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

  // 各 section の inner overflow-y-auto への ref。
  //   - aboutInnerRef:   mount 後に scrollHeight を測って outer vh を動的決定する
  //   - contactInnerRef: form の inner スクロールを indicator 進捗に合算する
  const aboutInnerRef = useRef<HTMLDivElement | null>(null)
  const contactInnerRef = useRef<HTMLDivElement | null>(null)
  // about の outer vh: 初期は DWELL_FULL (= inner overflow なし前提)。
  // mount 直後に実測して、overflow があれば DWELL_SMALL に切り替える。
  const [aboutVh, setAboutVh] = useState(DWELL_FULL)

  // セクションサイズ
  //   about: BirthdayCountdown 等の有無で inner overflow が変わるため mount 後に実測
  //   works: デスクトップは WorksCarousel が scrollYProgress でカルーセル位置を出すため
  //          WORKS_VH 必要、モバイルは MobileWorks の inner list だけなので outer は
  //          境界トリガー用に DWELL_SMALL まで縮める (= 縦リスト読了後の dead-zone を消す)
  const sectionHeights = useMemo(
    () => ({
      main: 180,
      about: aboutVh,
      works: isMobile ? DWELL_SMALL : WORKS_VH,
      contact: DWELL_SMALL,
    }),
    [aboutVh, isMobile],
  )
  const TOTAL_VH = useMemo(
    () => sectionHeights.main + sectionHeights.about + sectionHeights.works + sectionHeights.contact,
    [sectionHeights],
  )
  // 進捗 0-1 のセクション境界 (sectionHeights から派生)
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
  // useMotionValueEvent コールバックや navigate から最新値を参照するための ref
  const sectionRangesRef = useRef(sectionRanges)
  sectionRangesRef.current = sectionRanges

  // 現在表示中のセクション
  const [currentSection, setCurrentSection] = useState<SectionKey>("main")
  const currentSectionRef = useRef<SectionKey>("main")
  const [sectionProgress, setSectionProgress] = useState(0)

  // 遷移ロック: currentSection 変更直後 TRANSITION_LOCK_MS 間は新たな section commit と
  // wheel/touch を抑制する。これで「0.6s 中に次境界を踏んでチェーン発火」を防ぐ。
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

  // 現在 section の inner element (overflow-y-auto) を返す
  const getInnerEl = (key: SectionKey): HTMLDivElement | null => {
    if (key === "about") return aboutInnerRef.current
    if (key === "contact") return contactInnerRef.current
    return null
  }

  // インジケーター用 sectionProgress: outer (section 内 pixel) + inner.scrollTop を
  // 仮想 1 本のスクロールとして合算する (master の getCombinedScrollState 思想)。
  // これで contact のように inner overflow が outer budget より大きい section でも
  // inner スクロールが indicator に正しく反映される。
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

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const ranges = sectionRangesRef.current
    // hysteresis 付き section 検出 (forward/backward 両対応、複数飛びも追従)
    let target = currentSectionRef.current
    let targetIdx = SECTION_ORDER.indexOf(target)

    // 進行方向 (forward) に commit できる limit までインデックスを進める
    while (targetIdx < SECTION_ORDER.length - 1) {
      const nextKey = SECTION_ORDER[targetIdx + 1]
      const [nextStart] = ranges[nextKey]
      if (v >= nextStart + HYSTERESIS) {
        targetIdx++
        target = nextKey
      } else break
    }
    // 戻り方向 (backward) に commit できる limit までインデックスを戻す
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

  // inner overflow-y-auto の scroll で recomputeSectionProgress を呼ぶ。
  // (outer の scrollYProgress は inner-only scroll では動かないため、別経路で fire)
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
    // currentSection 変化で再評価対象が変わる + mounted で ref がセットされる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection, mounted])

  // about の inner overflow を実測して outer vh を切り替える。
  //   overflow あり (=BirthdayCountdown 等で content が viewport を超える) → DWELL_SMALL
  //   overflow なし (=普段)                                                → DWELL_FULL
  // mount 直後と daysUntilBirthday 変化時に再評価する。
  // 注: 切替により TOTAL_VH も変わり container の高さが変わるが、初回 mount 後すぐの
  // 切替なので user は scrollTop=0 (main) におり影響を受けない。
  useEffect(() => {
    if (!mounted) return
    let raf1 = 0
    let raf2 = 0
    // content layout 完了を 2 frame 待つ
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
  }, [mounted, daysUntilBirthday, isMobile])

  // wheel/touch は完全 native に委ねる (smooth scroll / 慣性スクロール維持)。
  // 引っ掛かりの原因 = section 内 outer 空スクロール の長さは、inner overflow を持つ section
  // (= contact、および birthday active 時の about) を DWELL_SMALL = 20vh に縮めることで
  // 構造的にゼロ近くまで圧縮している。
  // 残るのは transition lock 中の preventDefault のみ (0.6s スナップアニメの止め用)。
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

  // ヘッダーからの jump: instant (behavior:auto) で飛ばし、section を直接 commit する。
  // hysteresis を踏み越えた位置に scrollTo して useMotionValueEvent 側で再 commit されないようにする。
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

  // 各セクションの離散 animate ターゲット (me-vs-cur で x/opacity を決める)
  // - me === cur:  x="0%", opacity=1   (現在表示中)
  // - me >  cur:   x="100%", opacity=0 (未来側で右に待機)
  // - me <  cur:   x="-100%", opacity=0 (過去側で左に退避)
  // direction を別途持たなくても me-vs-cur 自体が方向情報を含むので変位が自然に決まる。
  const animateOf = (key: SectionKey): { x: string; opacity: number } => {
    const cur = SECTION_ORDER.indexOf(currentSection)
    const me = SECTION_ORDER.indexOf(key)
    if (me === cur) return { x: "0%", opacity: 1 }
    return { x: me > cur ? "100%" : "-100%", opacity: 0 }
  }

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
              initial={false}
              animate={animateOf("main")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "main" ? "auto" : "none" }}
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
                    className="pt-6 pb-20 text-center"
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
