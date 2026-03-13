import { Pacifico } from "next/font/google"
import { getDaysUntilBirthday } from "../lib/utils"
import { BIRTH_MONTH, BIRTH_DAY } from "../lib/constants"
import HomePage from "../components/home-page"

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export default function Home() {
  const initialDaysUntilBirthday = getDaysUntilBirthday(BIRTH_MONTH, BIRTH_DAY)

  return (
    <HomePage
      pacificoClassName={pacifico.className}
      initialDaysUntilBirthday={initialDaysUntilBirthday}
    />
  )
}
