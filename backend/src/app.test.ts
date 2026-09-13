import { describe, expect, it } from "vite-plus/test"
import { app } from "./app"

const bindings = {
  CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) },
}

describe("backend app routes", () => {
  it("reports a healthy backend", async () => {
    const response = await app.request("/api/health", {}, bindings)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  it.each(["https://t4ko.pet", "https://www.t4ko.pet"])(
    "allows the portfolio origin on health responses (%s)",
    async (origin) => {
      const response = await app.request("/api/health", { headers: { Origin: origin } }, bindings)

      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin)
      expect(response.headers.get("Vary")).toContain("Origin")
    },
  )

  it("handles the contact preflight with the public API contract", async () => {
    const response = await app.request(
      "/api/contact",
      {
        method: "OPTIONS",
        headers: {
          Origin: "https://t4ko.pet",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      },
      bindings,
    )

    expect(response.status).toBe(204)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://t4ko.pet")
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET,POST")
    expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type")
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull()
  })

  it("does not allow an unrelated origin", async () => {
    const response = await app.request(
      "/api/health",
      { headers: { Origin: "https://evil.example" } },
      bindings,
    )

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull()
  })

  it("returns not-found for the removed presence WebSocket route", async () => {
    const response = await app.request("/api/presence/ws", {}, bindings)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "not_found" },
    })
  })

  it("returns a structured not-found error for an unknown route", async () => {
    const response = await app.request("/api/missing", {}, bindings)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "not_found" },
    })
  })

  it("includes CORS headers on allowed-origin errors", async () => {
    const response = await app.request(
      "/api/missing",
      { headers: { Origin: "https://www.t4ko.pet" } },
      bindings,
    )

    expect(response.status).toBe(404)
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://www.t4ko.pet")
  })
})
