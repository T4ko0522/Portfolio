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

export interface SpotifyApiResponse {
  spotify?: {
    trackName: string
    artistName: string
    albumName: string
    albumArt: string
    isPlaying: boolean
    position: number // ミリ秒
    duration: number // ミリ秒
  }
  discord?: {
    userId: string
    status: 'online' | 'idle' | 'dnd' | 'offline'
    activities?: Array<{
      name: string
      type: number
      details?: string
      state?: string
      timestamps?: {
        start?: number
        end?: number
      }
      assets?: {
        largeImage?: string
        largeText?: string
      }
    }>
    timestamp: number
  }
  error?: string
}
