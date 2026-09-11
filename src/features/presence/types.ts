export interface SpotifyTrack {
  name: string
  artist: string
  album: string
  albumArtUrl: string
  isPlaying: boolean
  spotifyUrl?: string
  currentTime?: number // 現在の再生時間（秒）
  duration?: number // 総再生時間（秒）
}

export type DiscordStatus = "online" | "idle" | "dnd" | "offline"

export interface PresenceState {
  spotifyTrack: SpotifyTrack | null
  discordStatus: DiscordStatus | null
  isSpotifyLoading: boolean
}
