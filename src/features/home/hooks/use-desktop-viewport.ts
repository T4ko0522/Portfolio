import { useSyncExternalStore } from "react"

const query = "(min-width: 768px)"

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

function getSnapshot() {
  return window.matchMedia(query).matches
}

export function useDesktopViewport(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}
