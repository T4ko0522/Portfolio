"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"
import { sectionBackgrounds, projectDetails } from "../../lib/constants"
import type { SpotifyTrack } from "../../types/spotify"
import MobileHeader from "./header"
import MainSection from "../main-section"
import AboutSection from "../about-section"

const BgShader = dynamic(
  () => import("../bg-shader").then((m) => ({ default: m.BgShader })),
  { ssr: false }
)

const DottedSurface = dynamic(
  () => import("../dotted-surface").then((m) => ({ default: m.DottedSurface })),
  { ssr: false }
)

const ShootingStars = dynamic(
  () => import("../shooting-stars").then((m) => ({ default: m.ShootingStars })),
  { ssr: false }
)

type MobileWorksProps = { projects: typeof projectDetails }
const MobileWorks = dynamic<MobileWorksProps>(() => import("./works"), { ssr: false })

type MobileContactProps = {
  onCopyDiscord: () => void
  discordCopied: boolean
}
const MobileContact = dynamic<MobileContactProps>(() => import("./contact"), { ssr: false })

interface HomePageMobileProps {
  pacificoClassName: string
  daysUntilBirthday: number
  spotifyTrack: SpotifyTrack | null
  isSpotifyLoading: boolean
  discordStatus: "online" | "idle" | "dnd" | "offline" | null
  discordCopied: boolean
  onCopyDiscord: () => void
}

type SectionKey = "main" | "about" | "works" | "contact"
const SECTION_ORDER: SectionKey[] = ["main", "about", "works", "contact"]

// セクション初出現時の fade + slide-up
const sectionRevealProps = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
}

const bgTransition = { duration: 0.9, ease: [0.4, 0.0, 0.2, 1] as const }

const navigateToSection = (sectionId: string) => {
  if (typeof document === "undefined") return
  const el = document.getElementById(sectionId)
  if (!el) return
  el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function HomePageMobile({
  pacificoClassName,
  daysUntilBirthday,
  spotifyTrack,
  isSpotifyLoading,
  discordStatus,
  discordCopied,
  onCopyDiscord,
}: HomePageMobileProps) {
  // 現在ビューポートに最も占めているセクションを判定
  const [activeSection, setActiveSection] = useState<SectionKey>("main")

  useEffect(() => {
    if (typeof window === "undefined") return
    const visibleRatios = new Map<SectionKey, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = e.target.id as SectionKey
          if (e.isIntersecting) visibleRatios.set(id, e.intersectionRatio)
          else visibleRatios.delete(id)
        })
        if (visibleRatios.size === 0) return
        let best: SectionKey = "main"
        let bestRatio = -1
        visibleRatios.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id
            bestRatio = ratio
          }
        })
        setActiveSection((prev) => (prev === best ? prev : best))
      },
      { threshold: [0, 0.15, 0.35, 0.55, 0.75, 1] },
    )
    SECTION_ORDER.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* === 固定背景: セクション切替で cross-fade して境目を消す === */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black overflow-hidden">
        {/* Main: 背景画像 */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: activeSection === "main" ? 1 : 0 }}
          transition={bgTransition}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 w-full h-full overflow-hidden"
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
        </motion.div>

        {/* About: BgShader (desktop と同色) */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: activeSection === "about" ? 1 : 0 }}
          transition={bgTransition}
        >
          <BgShader
            colors={["#f97316", "#fb923c", "#fdba74", "#fda4af", "#fb7185", "#f472b6"]}
            distortion={2}
            swirl={1}
            speed={0.8}
            offsetX={0.08}
            veilOpacity="bg-black/20"
          />
        </motion.div>

        {/* Works: DottedSurface */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: activeSection === "works" ? 1 : 0 }}
          transition={bgTransition}
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
        </motion.div>

        {/* Contact: 流れ星 + radial gradient */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ opacity: activeSection === "contact" ? 1 : 0 }}
          transition={bgTransition}
        >
          <div className="absolute inset-0 bg-black">
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
              maxStars={6}
            />
            <ShootingStars
              starColor="#FFFFFF"
              trailColor="#FFFFFF"
              minSpeed={10}
              maxSpeed={25}
              minDelay={600}
              maxDelay={1500}
              maxStars={5}
            />
          </div>
        </motion.div>
      </div>

      <main className="relative w-full text-white">
        {/* ===== Main ===== */}
        <section id="main" className="relative min-h-screen w-full">
          <MainSection pacificoClassName={pacificoClassName} isMobile={true} />
        </section>

        {/* ===== About ===== */}
        <section id="about" className="relative w-full">
          <motion.div {...sectionRevealProps} className="relative w-full">
            <AboutSection
              isMobile={true}
              daysUntilBirthday={daysUntilBirthday}
              discordStatus={discordStatus}
              spotifyTrack={spotifyTrack}
              isSpotifyLoading={isSpotifyLoading}
            />
          </motion.div>
        </section>

        {/* ===== Works ===== */}
        <section id="works" className="relative w-full">
          <motion.div {...sectionRevealProps} className="relative w-full px-4 py-16">
            <MobileWorks projects={projectDetails} />
          </motion.div>
        </section>

        {/* ===== Contact ===== */}
        <section id="contact" className="relative w-full">
          <motion.div {...sectionRevealProps} className="relative w-full pt-24 pb-10">
            <MobileContact onCopyDiscord={onCopyDiscord} discordCopied={discordCopied} />
            <footer className="pt-10 pb-6 text-center">
              <p className="text-gray-400 text-xs">
                © {new Date().getFullYear()} T4ko0522. All rights reserved.
              </p>
            </footer>
          </motion.div>
        </section>
      </main>

      <MobileHeader onNavigate={navigateToSection} />
    </>
  )
}
