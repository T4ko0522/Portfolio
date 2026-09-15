import type { PresenceSnapshot } from "../../../shared/presence"

const DEFAULT_POLL_DELAY_MS = 30_000

export function getPresencePollDelay(snapshot: PresenceSnapshot, now: number): number {
  const track = snapshot.spotifyTrack
  if (
    !track?.isPlaying ||
    track.currentTime === undefined ||
    track.duration === undefined ||
    !snapshot.updatedAt
  ) {
    return DEFAULT_POLL_DELAY_MS
  }

  const elapsedSeconds = Math.max(0, (now - Date.parse(snapshot.updatedAt)) / 1000)
  const remainingMs = (track.duration - track.currentTime - elapsedSeconds) * 1000

  return remainingMs > 0 ? Math.min(DEFAULT_POLL_DELAY_MS, remainingMs) : DEFAULT_POLL_DELAY_MS
}
