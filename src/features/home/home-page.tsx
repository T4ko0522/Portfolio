import { useEffect, useState } from "react"
import Image from "@/components/ui/image"
import { useClipboardFeedback } from "@/features/contact/use-clipboard-feedback"
import { useBirthdayCountdown } from "@/features/profile/use-birthday-countdown"
import { usePresence } from "@/features/presence/use-presence"
import HomePageDesktop from "./home-page-desktop"
import HomePageMobile from "./mobile/home-page-mobile"
import LoadingScreen from "./loading-screen"
import { useDesktopViewport } from "./hooks/use-desktop-viewport"

const BIRTH_MONTH = 5
const BIRTH_DAY = 22

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const daysUntilBirthday = useBirthdayCountdown(BIRTH_MONTH, BIRTH_DAY)
  const presence = usePresence()
  const clipboard = useClipboardFeedback()
  const isDesktop = useDesktopViewport()
  const pageProps = { daysUntilBirthday, ...presence, ...clipboard }

  useEffect(() => {
    if (!isLoading) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isLoading])

  return (
    <>
      <div className="hidden" aria-hidden="true">
        <Image
          src="https://cdn.discordapp.com/media/v1/collectibles-shop/1306330663070334996/animated"
          alt=""
          width={128}
          height={128}
          priority
        />
      </div>

      <div {...(isLoading ? { inert: "" } : {})} aria-hidden={isLoading || undefined}>
        {isDesktop !== false && (
          <div className="hidden desktop:block">
            <HomePageDesktop {...pageProps} />
          </div>
        )}
        {isDesktop !== true && (
          <div className="block desktop:hidden">
            <HomePageMobile {...pageProps} />
          </div>
        )}
      </div>

      {isLoading && <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}
    </>
  )
}
