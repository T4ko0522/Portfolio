import { z } from "zod"

export const discordStatusSchema = z.enum(["online", "idle", "dnd", "offline"])
export const spotifyTrackSchema = z.object({
  name: z.string(),
  artist: z.string(),
  album: z.string(),
  albumArtUrl: z.string().url(),
  isPlaying: z.boolean(),
  spotifyUrl: z.string().url().optional(),
  currentTime: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
})

export const presenceSnapshotSchema = z.object({
  connection: z.enum(["connecting", "connected", "disconnected"]),
  discordStatus: discordStatusSchema.nullable(),
  spotifyTrack: spotifyTrackSchema.nullable(),
  updatedAt: z.string().datetime().nullable(),
})

export type SpotifyTrack = z.infer<typeof spotifyTrackSchema>
export type DiscordStatus = z.infer<typeof discordStatusSchema>
export type PresenceSnapshot = z.infer<typeof presenceSnapshotSchema>

export function emptyPresence(connection: PresenceSnapshot["connection"]): PresenceSnapshot {
  return { connection, discordStatus: null, spotifyTrack: null, updatedAt: null }
}
