import { useSyncExternalStore, type PropsWithChildren, type ReactNode } from "react"

const subscribe = () => () => undefined

export function ClientOnly({
  children,
  fallback = null,
}: PropsWithChildren<{ fallback?: ReactNode }>) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  return isClient ? children : fallback
}
