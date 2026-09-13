import type { DiscordStatus, SpotifyTrack, PresenceSnapshot } from "../../../shared/presence"
export type { DiscordStatus, SpotifyTrack } from "../../../shared/presence"

export interface PresenceState {
  spotifyTrack: SpotifyTrack | null
  discordStatus: DiscordStatus | null
  isSpotifyLoading: boolean
  presenceConnection: PresenceSnapshot["connection"]
}
