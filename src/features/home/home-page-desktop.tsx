"use client"

import { lazy, Suspense, useEffect, useState, type ReactNode } from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { cn } from "@/components/ui/utils"
import { mainBackground, pageTransition } from "./content"
import { projectDetails } from "@/features/works/projects"
import type { DiscordStatus, SpotifyTrack, PresenceState } from "@/features/presence/types"
import Image from "@/components/ui/image"
import Header from "./header"
import ContactSection from "@/features/contact/contact-section"
import MainSection from "./main-section"
import AboutSection from "@/features/profile/about-section"
import ScrollIndicator from "./scroll-indicator"
import { ClientOnly } from "@/components/effects/client-only"
import WorksCarousel from "@/features/works/works-carousel"
import { useDesktopScroll } from "./hooks/use-desktop-scroll"

const BgShader = lazy(() =>
  import("@/components/effects/bg-shader").then((m) => ({ default: m.BgShader })),
)
const DottedSurface = lazy(() =>
  import("@/components/effects/dotted-surface").then((m) => ({ default: m.DottedSurface })),
)
const ShootingStars = lazy(() =>
  import("@/components/effects/shooting-stars").then((m) => ({ default: m.ShootingStars })),
)

function ClientEffect({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <Suspense fallback={null}>{children}</Suspense>
    </ClientOnly>
  )
}

interface HomePageDesktopProps {
  daysUntilBirthday: number | null
  spotifyTrack: SpotifyTrack | null
  isSpotifyLoading: boolean
  presenceConnection: PresenceState["presenceConnection"]
  discordStatus: DiscordStatus | null
  discordCopied: boolean
  onCopyDiscord: () => void
}

const WORKS_PADDING = 0.4

export default function HomePageDesktop({
  daysUntilBirthday,
  spotifyTrack,
  isSpotifyLoading,
  presenceConnection,
  discordStatus,
  discordCopied,
  onCopyDiscord,
}: HomePageDesktopProps) {
  const worksMinIndex = 0
  const worksMaxIndex = Math.max(0, projectDetails.length - 1)
  const [worksActiveIndex, setWorksActiveIndex] = useState(worksMinIndex)
  const worksPosition = useMotionValue(0)
  const {
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
  } = useDesktopScroll(projectDetails.length, daysUntilBirthday)

  // works カルーセル: works section 内の進捗を 0..projects.length-1 にマップ
  const worksLocalSpan = sectionRanges.works[1] - sectionRanges.works[0]
  const worksInnerStart =
    sectionRanges.works[0] + ((WORKS_PADDING * 100) / sectionHeights.works) * worksLocalSpan
  const worksInnerEnd =
    sectionRanges.works[1] - ((WORKS_PADDING * 100) / sectionHeights.works) * worksLocalSpan
  const worksCarouselPos = useTransform(
    scrollYProgress,
    [worksInnerStart, worksInnerEnd],
    [worksMinIndex, worksMaxIndex],
    { clamp: true },
  )

  useEffect(() => {
    const unsub = worksCarouselPos.on("change", (p) => {
      worksPosition.set(p)
      const idx = Math.max(worksMinIndex, Math.min(worksMaxIndex, Math.round(p)))
      setWorksActiveIndex((prev) => (prev === idx ? prev : idx))
    })
    return () => unsub()
  }, [worksCarouselPos, worksPosition, worksMinIndex, worksMaxIndex])

  const handleWorksActiveIndexChange = (idx: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const span = worksInnerEnd - worksInnerStart
    const stepsTotal = Math.max(1, worksMaxIndex - worksMinIndex)
    const targetProgress = worksInnerStart + ((idx - worksMinIndex) / stepsTotal) * span
    const max = container.scrollHeight - container.clientHeight
    container.scrollTo({ top: targetProgress * max, behavior: "smooth" })
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-black no-scrollbar"
      >
        <div className="relative w-full" style={{ height: `${totalVh}vh` }}>
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            {/* ===== Main ===== */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={animateSection("main")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "main" ? "auto" : "none" }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{
                  filter: mainBackground.filter,
                  transform: "scale(1.3) translateZ(0px)",
                }}
              >
                <Image
                  src={mainBackground.image}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover"
                  style={{ objectPosition: mainBackground.position }}
                  priority
                />
              </div>
              <div className="relative z-10 w-full h-full">
                <MainSection isMobile={false} />
              </div>
            </motion.div>

            {/* ===== About ===== */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={animateSection("about")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "about" ? "auto" : "none" }}
            >
              <ClientEffect>
                <BgShader
                  colors={["#f97316", "#fb923c", "#fdba74", "#fda4af", "#fb7185", "#f472b6"]}
                  distortion={2}
                  swirl={1}
                  speed={0.8}
                  offsetX={0.08}
                  veilOpacity="bg-black/20"
                />
              </ClientEffect>
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
                  presenceConnection={presenceConnection}
                />
              </div>
            </motion.div>

            {/* ===== Works ===== */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={animateSection("works")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "works" ? "auto" : "none" }}
            >
              <ClientEffect>
                <DottedSurface className="absolute inset-0" speed={0.02}>
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute -top-10 left-1/2 size-full -translate-x-1/2 rounded-full",
                      "bg-[radial-gradient(ellipse_at_center,hsl(var(--foreground)/0.1),transparent_50%)]",
                      "blur-[30px]",
                    )}
                  />
                </DottedSurface>
              </ClientEffect>
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
              animate={animateSection("contact")}
              transition={pageTransition}
              style={{ pointerEvents: currentSection === "contact" ? "auto" : "none" }}
            >
              <div className="absolute inset-0 pointer-events-none bg-black" style={{ zIndex: 0 }}>
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,rgba(0,0,0,0)_80%)]" />
                  <div className="stars absolute inset-0" />
                </div>
                <ClientEffect>
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
                </ClientEffect>
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
