import { describe, expect, it } from "vite-plus/test"
import { getDaysUntilBirthday } from "./birthday"

describe("birthday countdown", () => {
  it("shows zero throughout the birthday", () => {
    expect(getDaysUntilBirthday(5, 22, new Date(2026, 4, 22, 23, 59))).toBe(0)
  })
  it("counts the day before as one day regardless of time", () => {
    expect(getDaysUntilBirthday(5, 22, new Date(2026, 4, 21, 23, 59))).toBe(1)
  })

  it("counts toward next year after the birthday", () => {
    expect(getDaysUntilBirthday(5, 22, new Date(2026, 4, 23))).toBe(364)
  })

  it("includes February 29 when the interval crosses a leap day", () => {
    expect(getDaysUntilBirthday(5, 22, new Date(2027, 4, 23))).toBe(365)
  })
})
