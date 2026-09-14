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

const spotifyActivitySchema = z.object({
  name: z.literal("Spotify"),
  type: z.literal(2),
  details: z.string(),
  state: z.string(),
  timestamps: z.object({
    start: dateTimestampSchema,
    end: dateTimestampSchema,
  }),
  assets: z.object({
    largeImage: z.string(),
    largeText: z.string(),
  }),
})

const statusJsonSchema = z.object({
  discord: discordPresenceSchema,
})

function nonEmpty(value: string | undefined) {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function httpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function normalizeSpotify(activities: unknown[], now: Date): SpotifyTrack | null {
  for (const activity of activities) {
    const parsed = spotifyActivitySchema.safeParse(activity)
    if (!parsed.success) continue

    const name = nonEmpty(parsed.data.details)
    const artist = nonEmpty(parsed.data.state)
    const album = nonEmpty(parsed.data.assets.largeText)
    const image = nonEmpty(parsed.data.assets.largeImage)
    const imageUrl = image ? httpsUrl(image) : null
    const durationMs = parsed.data.timestamps.end - parsed.data.timestamps.start
    if (!name || !artist || !album || !imageUrl || durationMs < 0) return null

    const currentTimeMs = Math.min(
      durationMs,
      Math.max(0, now.getTime() - parsed.data.timestamps.start),
    )

    return {
      name,
      artist,
      album,
      albumArtUrl: imageUrl,
      isPlaying: true,
      currentTime: currentTimeMs / 1_000,
      duration: durationMs / 1_000,
    }
  }

  return null
}

export function normalizeStatusJson(value: unknown, now: Date): PresenceSnapshot {
  const parsed = statusJsonSchema.parse(value)

  return {
    connection: "connected",
    discordStatus: parsed.discord.status,
    spotifyTrack:
      parsed.discord.status === "offline" ? null : normalizeSpotify(parsed.discord.activities, now),
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
