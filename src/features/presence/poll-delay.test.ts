import { describe, expect, it } from "vite-plus/test"
import type { PresenceSnapshot } from "../../../shared/presence"
import { getPresencePollDelay } from "./poll-delay"

const now = Date.parse("2026-09-15T00:00:10.000Z")

const baseTrack: NonNullable<PresenceSnapshot["spotifyTrack"]> = {
  name: "Song",
  artist: "Artist",
  album: "Album",
  albumArtUrl: "https://cdn.example/album.png",
  isPlaying: true,
  currentTime: 118,
  duration: 120,
}

function makeSnapshot(
  track: NonNullable<PresenceSnapshot["spotifyTrack"]> | null = baseTrack,
  updatedAt: string | null = new Date(now).toISOString(),
): PresenceSnapshot {
  return {
    connection: "connected",
    discordStatus: null,
    spotifyTrack: track,
    updatedAt,
  }
}

describe("presence polling delay", () => {
  it("polls when the currently playing track is about to end", () => {
    expect(getPresencePollDelay(makeSnapshot(baseTrack, "2026-09-15T00:00:09.500Z"), now)).toBe(1500)
  })

  it.each([
    ["more than 30 seconds remain", { ...baseTrack, currentTime: 89 }, null, 30_000],
    ["the track has already ended", { ...baseTrack, currentTime: 120 }, null, 30_000],
    ["playback is stopped", { ...baseTrack, isPlaying: false }, null, 30_000],
    ["current time is missing", { ...baseTrack, currentTime: undefined }, null, 30_000],
    ["duration is missing", { ...baseTrack, duration: undefined }, null, 30_000],
    ["updatedAt is missing", baseTrack, "missing", 30_000],
  ])("waits for the default interval when %s", (_case, track, updatedAt, expectedDelay) => {
    const snapshot = makeSnapshot(track, updatedAt === "missing" ? null : undefined)

    expect(getPresencePollDelay(snapshot, now)).toBe(expectedDelay)
  })

  it("waits for the default interval when no track is present", () => {
    expect(getPresencePollDelay(makeSnapshot(null), now)).toBe(30_000)
  })

  it("does not count negative elapsed time for a future updatedAt", () => {
    const updatedAt = new Date(now + 5_000).toISOString()

    expect(getPresencePollDelay(makeSnapshot(baseTrack, updatedAt), now)).toBe(2_000)
  })
})
