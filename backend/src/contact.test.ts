import { afterAll, afterEach, beforeAll, describe, expect, it } from "vite-plus/test"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { app } from "./app"

const validContact = {
  name: "Tako",
  email: "tako@example.com",
  subject: "Portfolio",
  message: "お問い合わせの本文です。",
}

const requestInit = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
})

const configuredBindings = () => ({
  CONTACT_DISCORD_WEBHOOK_URL: "https://discord.example/webhooks/contact",
  TURNSTILE_SECRET_KEY: "turnstile-secret",
  CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) },
})

const server = setupServer()

describe("POST /api/contact", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it("returns validation_error for invalid contact input", async () => {
    const response = await app.request(
      "/api/contact",
      requestInit({
        ...validContact,
        name: "",
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "validation_error" },
    })
  })

  it("returns not_configured when contact delivery is not configured", async () => {
    const response = await app.request("/api/contact", requestInit(validContact), {
      CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    })

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "not_configured" },
    })
  })

  it("returns invalid_request for malformed JSON", async () => {
    const response = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      },
      configuredBindings(),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "invalid_request" },
    })
  })

  it("returns unsupported_media_type for a non-JSON request", async () => {
    const response = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: JSON.stringify(validContact),
      },
      configuredBindings(),
    )

    expect(response.status).toBe(415)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "unsupported_media_type" },
    })
  })

  it("rejects a request body larger than 16 KiB", async () => {
    const body = JSON.stringify({
      ...validContact,
      extra: "x".repeat(16 * 1024),
    })
    const response = await app.request(
      "/api/contact",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      },
      configuredBindings(),
    )

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "payload_too_large" },
    })
  })

  it("accepts honeypot submissions without delivering them", async () => {
    let externalRequest = false
    server.use(
      http.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", () => {
        externalRequest = true
        return HttpResponse.json({ success: true })
      }),
      http.post("https://discord.example/webhooks/contact", () => {
        externalRequest = true
        return HttpResponse.json({ id: "message-id" })
      }),
    )

    const response = await app.request(
      "/api/contact",
      requestInit({
        ...validContact,
        website: "https://spam.example",
        turnstileToken: "turnstile-token",
      }),
      configuredBindings(),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(externalRequest).toBe(false)
  })

  it("returns rate_limited with a retry hint when the limiter rejects the request", async () => {
    let rateLimitKey: string | undefined
    const response = await app.request(
      "/api/contact",
      requestInit({ ...validContact, turnstileToken: "turnstile-token" }),
      {
        ...configuredBindings(),
        CONTACT_RATE_LIMITER: {
          limit: async ({ key }: { key: string }) => {
            rateLimitKey = key
            return { success: false }
          },
        },
      },
    )

    expect(response.status).toBe(429)
    expect(response.headers.get("Retry-After")).toBe("60")
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "rate_limited" },
    })
    expect(rateLimitKey).toBe("unknown")
  })

  it("returns verification_failed when Turnstile rejects the token", async () => {
    server.use(
      http.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", () =>
        HttpResponse.json({ success: false, "error-codes": ["invalid-input-response"] }),
      ),
    )

    const response = await app.request(
      "/api/contact",
      requestInit({ ...validContact, turnstileToken: "turnstile-token" }),
      configuredBindings(),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "verification_failed" },
    })
  })

  it("returns verification_failed when the Turnstile token is missing", async () => {
    const response = await app.request(
      "/api/contact",
      requestInit(validContact),
      configuredBindings(),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "verification_failed" },
    })
  })

  it("returns validation_error when the Turnstile token exceeds its limit", async () => {
    const response = await app.request(
      "/api/contact",
      requestInit({ ...validContact, turnstileToken: "x".repeat(2_049) }),
      configuredBindings(),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "validation_error" },
    })
  })

  it("returns delivery_failed when Discord rejects the webhook", async () => {
    server.use(
      http.post("https://challenges.cloudflare.com/turnstile/v0/siteverify", () =>
        HttpResponse.json({ success: true }),
      ),
      http.post("https://discord.example/webhooks/contact", () =>
        HttpResponse.json({ message: "failed" }, { status: 500 }),
      ),
    )

    const response = await app.request(
      "/api/contact",
      requestInit({ ...validContact, turnstileToken: "turnstile-token" }),
      configuredBindings(),
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "delivery_failed" },
    })
  })

  it("verifies Turnstile and delivers the complete contact message to Discord", async () => {
    let turnstileRequested = false
    let discordPayload: unknown

    server.use(
      http.post(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        async ({ request }) => {
          const form = await request.formData()
          expect(form.get("secret")).toBe("turnstile-secret")
          expect(form.get("response")).toBe("turnstile-token")
          turnstileRequested = true
          return HttpResponse.json({ success: true })
        },
      ),
      http.post("https://discord.example/webhooks/contact", async ({ request }) => {
        discordPayload = await request.json()
        return HttpResponse.json({ id: "message-id" })
      }),
    )

    const response = await app.request(
      "/api/contact",
      requestInit({ ...validContact, turnstileToken: "turnstile-token" }),
      {
        ...configuredBindings(),
      },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(turnstileRequested).toBe(true)
    expect(JSON.stringify(discordPayload)).toContain(validContact.message)
  })
})
