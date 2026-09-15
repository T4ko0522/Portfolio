import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { emptyPresence, presenceSnapshotSchema } from "../../../shared/presence"
import { getPresencePollDelay } from "./poll-delay"
import type { PresenceState } from "./types"

export function usePresence(): PresenceState {
  const [snapshot, setSnapshot] = useState(emptyPresence("connecting"))
  const [now, setNow] = useState(0)

  useEffect(() => {
    let disposed = false
    let polling = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    const controller = new AbortController()
    const poll = async () => {
      if (disposed || polling || document.hidden) return
      polling = true
      let nextPollDelay = 30_000
      clearTimeout(retryTimer)
      try {
        const response = await apiClient.api.presence.$get(
          {},
          {
            init: { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]) },
          },
        )
        if (!response.ok) throw new Error("Presence unavailable")
        const next = presenceSnapshotSchema.parse(await response.json())
        if (disposed) return
        const receivedAt = Date.now()
        setSnapshot(next)
        setNow(receivedAt)
        nextPollDelay = getPresencePollDelay(next, receivedAt)
      } catch {
        if (!disposed) setSnapshot(emptyPresence("disconnected"))
      } finally {
        polling = false
        if (!disposed && !document.hidden) {
          retryTimer = setTimeout(() => void poll(), nextPollDelay)
        }
      }
    }
    const onVisibilityChange = () => {
      clearTimeout(retryTimer)
      if (!document.hidden) void poll()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    void poll()
    return () => {
      disposed = true
      controller.abort()
      clearTimeout(retryTimer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (!snapshot.spotifyTrack?.isPlaying) return
    const clock = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(clock)
  }, [snapshot.spotifyTrack?.isPlaying])

  const track = snapshot.spotifyTrack
  const elapsed = snapshot.updatedAt
    ? Math.max(0, (now - Date.parse(snapshot.updatedAt)) / 1000)
    : 0
  return {
    discordStatus: snapshot.discordStatus,
    spotifyTrack:
      track && track.currentTime !== undefined && track.duration !== undefined
        ? { ...track, currentTime: Math.min(track.duration, track.currentTime + elapsed) }
        : track,
    isSpotifyLoading: snapshot.connection === "connecting",
    presenceConnection: snapshot.connection,
  }
}
