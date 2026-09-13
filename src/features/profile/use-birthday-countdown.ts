import { useEffect, useState } from "react"
import { getDaysUntilBirthday } from "./birthday"

export function useBirthdayCountdown(month: number, day: number): number | null {
  const [days, setDays] = useState<number | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const update = () => {
      const now = new Date()
      setDays(getDaysUntilBirthday(month, day, now))
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timer = setTimeout(update, midnight.getTime() - now.getTime())
    }
    update()
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer)
        update()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [month, day])

  return days
}
