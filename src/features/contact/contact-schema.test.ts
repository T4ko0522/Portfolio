import { describe, expect, it } from "vite-plus/test"
import { contactSchema } from "./contact-schema"

const message = {
  name: "Tako",
  email: "tako@example.com",
  subject: "Portfolio",
  message: "お問い合わせの本文です。",
}

describe("contact input", () => {
  it("trims fields before checking required input", () => {
    const result = contactSchema.parse({
      ...message,
      name: "  Tako  ",
      email: " tako@example.com ",
    })
    expect(result.name).toBe("Tako")
    expect(result.email).toBe("tako@example.com")
  })

  it.each([
    ["blank name", { name: "   " }],
    ["invalid email", { email: "invalid" }],
    ["blank subject", { subject: " " }],
    ["short message", { message: "123456789" }],
    ["long message", { message: "a".repeat(2001) }],
  ])("rejects %s", (_name, invalidFields) => {
    expect(contactSchema.safeParse({ ...message, ...invalidFields }).success).toBe(false)
  })

  it("accepts a message at the maximum length", () => {
    expect(contactSchema.safeParse({ ...message, message: "a".repeat(2000) }).success).toBe(true)
  })
})
