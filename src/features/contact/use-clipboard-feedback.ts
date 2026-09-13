import { useEffect, useRef, useState } from "react"

export function useClipboardFeedback() {
  const [discordCopied, setDiscordCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current)
    },
    [],
  )

  const onCopyDiscord = async () => {
    try {
      await navigator.clipboard.writeText("tako._.v")
      if (resetTimer.current !== null) clearTimeout(resetTimer.current)
      setDiscordCopied(true)
      resetTimer.current = setTimeout(() => setDiscordCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy Discord username:", error)
    }
  }

  return { discordCopied, onCopyDiscord }
}
