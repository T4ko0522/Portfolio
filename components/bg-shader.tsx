"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import Image from "next/image"
import { useEffect, useState } from "react"

interface BgShaderProps {
  colors?: string[]
  distortion?: number
  swirl?: number
  speed?: number
  offsetX?: number
  veilOpacity?: string
  className?: string
}

function isWebGLUsable(): boolean {
  if (typeof window === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl")
    if (!gl) return false
    type GlWithDebug = WebGLRenderingContext & {
      getExtension(name: string): { UNMASKED_RENDERER_WEBGL: number } | null
      getParameter(p: number): string
    }
    const debugInfo = (gl as GlWithDebug).getExtension("WEBGL_debug_renderer_info")
    const renderer = debugInfo ? (gl as GlWithDebug).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : ""
    const isSoftware = /SwiftShader|llvmpipe|Microsoft Basic Render|software/i.test(renderer)
    return !isSoftware
  } catch {
    return false
  }
}

const FALLBACK_IMAGE = "/images/About.png"

export function BgShader({
  colors = ["#72b9bb", "#b5d9d9", "#ffd1bd", "#ffebe0", "#8cc5b8", "#dbf4a4"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  veilOpacity = "bg-white/20 dark:bg-black/25",
  className = "",
}: BgShaderProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUseFallback(!isWebGLUsable())
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, 150)
    }
    setDimensions({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className={`fixed inset-0 w-screen h-screen pointer-events-none ${className}`}>
      {mounted && (
        <>
          {useFallback ? (
            <Image
              src={FALLBACK_IMAGE}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
              aria-hidden
            />
          ) : (
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={colors}
              distortion={distortion}
              swirl={swirl}
              grainMixer={0}
              grainOverlay={0}
              speed={speed}
              offsetX={offsetX}
            />
          )}
          {!useFallback && (
            <div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
          )}
        </>
      )}
    </div>
  )
}
