import type { PresenceState } from "./types"

// The external WebSocket connection will be added when its contract is ready.
const disconnectedPresence: PresenceState = {
  spotifyTrack: null,
  discordStatus: null,
  isSpotifyLoading: false,
}

export function usePresence(): PresenceState {
  return disconnectedPresence
}
