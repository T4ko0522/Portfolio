import { z } from "zod"
import {
  discordStatusSchema,
  type PresenceSnapshot,
  type SpotifyTrack,
} from "../../shared/presence"

export const STATUS_JSON_URL = "https://xs492099.xsrv.jp/status.json"

const dateTimestampSchema = z.number().finite().nonnegative().max(8_640_000_000_000_000)

const discordPresenceSchema = z.object({
  userId: z.string(),
  status: discordStatusSchema,
  activities: z.array(z.unknown()),
  timestamp: dateTimestampSchema,
})

const spotifyPresenceSchema = z.object({
  trackName: z.string().optional(),
  artistName: z.string().optional(),
  albumName: z.string().optional(),
  albumArt: z.string().optional(),
  duration: z.number().finite().nonnegative().optional(),
  position: z.number().finite().nonnegative().optional(),
  isPlaying: z.boolean().optional(),
  timestamp: dateTimestampSchema,
})

const statusJsonSchema = z.object({
  discord: discordPresenceSchema,
  spotify: z.unknown().optional(),
})

function nonEmpty(value: string | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function albumArtUrl(value: string) {
  const spotifyImage = /^spotify:([a-zA-Z0-9]+)$/.exec(value)
  if (spotifyImage) return `https://i.scdn.co/image/${spotifyImage[1]}`

  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function normalizeSpotify(value: unknown, now: Date): SpotifyTrack | null {
  const parsed = spotifyPresenceSchema.safeParse(value)
  if (!parsed.success || parsed.data.isPlaying !== true) return null

  const name = nonEmpty(parsed.data.trackName)
  const artist = nonEmpty(parsed.data.artistName)
  const image = nonEmpty(parsed.data.albumArt)
  const imageUrl = image ? albumArtUrl(image) : null
  if (!name || !artist || !imageUrl) return null

  const elapsed = Math.max(0, now.getTime() - parsed.data.timestamp)
  const durationMs = parsed.data.duration
  const positionMs = parsed.data.position
  const currentTimeMs =
    positionMs === undefined
      ? undefined
      : Math.min(durationMs ?? Number.POSITIVE_INFINITY, positionMs + elapsed)

  return {
    name,
    artist,
    album: parsed.data.albumName?.trim() ?? "",
    albumArtUrl: imageUrl,
    isPlaying: true,
    currentTime: currentTimeMs === undefined ? undefined : currentTimeMs / 1_000,
    duration: durationMs === undefined ? undefined : durationMs / 1_000,
  }
}

export function normalizeStatusJson(value: unknown, now: Date): PresenceSnapshot {
  const parsed = statusJsonSchema.parse(value)

  return {
    connection: "connected",
    discordStatus: parsed.discord.status,
    spotifyTrack:
      parsed.discord.status === "offline" ? null : normalizeSpotify(parsed.spotify, now),
    updatedAt: now.toISOString(),
  }
}

export async function fetchStatusJson(now = new Date()): Promise<PresenceSnapshot> {
  const response = await fetch(STATUS_JSON_URL, {
    signal: AbortSignal.timeout(8_000),
    cf: { cacheEverything: true, cacheTtl: 15 },
  })
  if (!response.ok) throw new Error(`status.json returned HTTP ${response.status}`)

  return normalizeStatusJson(await response.json(), now)
}
