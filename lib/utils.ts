import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDaysUntilBirthday(birthMonth: number, birthDay: number): number {
  const today = new Date()
  const currentYear = today.getFullYear()

  // 今日の日付を時間部分を無視して設定
  const todayDate = new Date(currentYear, today.getMonth(), today.getDate())

  // 今年の誕生日を時間部分を無視して設定
  let nextBirthday = new Date(currentYear, birthMonth - 1, birthDay)

  // 今年の誕生日が過ぎている場合は来年の誕生日を計算
  if (todayDate > nextBirthday) {
    nextBirthday = new Date(currentYear + 1, birthMonth - 1, birthDay)
  }

  // 日数の差を計算
  const diffTime = nextBirthday.getTime() - todayDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}
