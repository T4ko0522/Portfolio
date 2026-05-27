"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getDaysUntilBirthday } from "../lib/utils"
import { BIRTH_MONTH, BIRTH_DAY } from "../lib/constants"
import type { SpotifyTrack, SpotifyApiResponse } from "../types/spotify"
import LoadingScreen from "./loading-screen"
import StaggeredCurtainReveal from "./staggered-curtain-reveal"
import { useIsMobile } from "../hooks/use-mobile"
import HomePageDesktop from "./home-page-desktop"
import HomePageMobile from "./mobile/home-page"

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
  const [discordStatus, setDiscordStatus] = useState<"online" | "idle" | "dnd" | "offline" | null>(null)
  const [discordCopied, setDiscordCopied] = useState(false)

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
        const res = await fetch("/api/v1/spotify-status", {
          signal: pollAbortController.signal,
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

    const startPolling = () => {
      if (pollIntervalId !== null) return
      fetchOnce()
      pollIntervalId = setInterval(fetchOnce, 5000)
    }

    const connectWebSocket = () => {
      if (cancelled) return
      if (typeof window === "undefined" || typeof WebSocket === "undefined") {
        startPolling()
        return
      }

      if (!openedOnce) fetchOnce()

      const scheme = window.location.protocol === "https:" ? "wss" : "ws"
      const wsUrl = `${scheme}://${window.location.host}/api/v1/spotify-status/ws`
      let didOpen = false

      try {
        socket = new WebSocket(wsUrl)
      } catch (error) {
        console.warn("WebSocket constructor failed, falling back to polling:", error)
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
            console.error("Spotify status error:", data.error)
          } else {
            applyData(data)
          }
        } catch (error) {
          console.error("Failed to parse WS payload:", error)
        } finally {
          if (!cancelled) setIsSpotifyLoading(false)
        }
      }

      const handleDisconnect = () => {
        socket = null
        if (cancelled) return

        if (!didOpen && !openedOnce) {
          wsAttempt++
          if (wsAttempt >= 2) {
            startPolling()
            return
          }
        }

        const delay = Math.min(30_000, 1_000 * 2 ** Math.min(wsAttempt, 5))
        wsAttempt++
        startPolling()
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

      {mounted &&
        (isMobile ? (
          <HomePageMobile
            pacificoClassName={pacificoClassName}
            daysUntilBirthday={daysUntilBirthday}
            spotifyTrack={spotifyTrack}
            isSpotifyLoading={isSpotifyLoading}
            discordStatus={discordStatus}
            discordCopied={discordCopied}
            onCopyDiscord={handleCopyDiscord}
          />
        ) : (
          <HomePageDesktop
            pacificoClassName={pacificoClassName}
            daysUntilBirthday={daysUntilBirthday}
            spotifyTrack={spotifyTrack}
            isSpotifyLoading={isSpotifyLoading}
            discordStatus={discordStatus}
            discordCopied={discordCopied}
            onCopyDiscord={handleCopyDiscord}
          />
        ))}

      {/* ローディング画面 */}
      <StaggeredCurtainReveal isVisible={isLoading}>
        <LoadingScreen key="loading" onLoadingComplete={handleLoadingComplete} />
      </StaggeredCurtainReveal>
    </>
  )
}
