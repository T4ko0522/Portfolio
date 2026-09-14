import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { app } from "./app"

const statusUrl = "https://xs492099.xsrv.jp/status.json"
const fixedNow = new Date("2026-09-14T00:00:10.000Z")

const discord = (status = "online") => ({
  userId: "discord-user",
  status,
  activities: [{ name: "Custom Status", type: 4 }],
  timestamp: fixedNow.getTime(),
})

const spotifyActivity = ({
  start = fixedNow.getTime() - 75_000,
  end = fixedNow.getTime() + 105_000,
  largeImage = "https://i.scdn.co/image/abcdef",
} = {}) => ({
  name: "Spotify",
  type: 2,
  details: "Song",
  state: "Artist",
  timestamps: { start, end },
  assets: { largeImage, largeText: "Album" },
})

const bindings = {
  CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) },
}

const server = setupServer()

describe("GET /api/presence", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
  afterEach(() => {
    server.resetHandlers()
    vi.useRealTimers()
  })
  afterAll(() => server.close())

  it("fetches status.json and normalizes the Discord and Spotify presence", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    let requested = false
    server.use(
      http.get(statusUrl, ({ request }) => {
        requested = request.url === statusUrl
        return HttpResponse.json({
          discord: {
            ...discord(),
            activities: [{ name: "Custom Status", type: 4 }, spotifyActivity()],
          },
        })
      }),
    )

    const response = await app.request("/api/presence", {}, bindings)

    expect(response.status).toBe(200)
    expect(requested).toBe(true)
    await expect(response.json()).resolves.toEqual({
      connection: "connected",
      discordStatus: "online",
      spotifyTrack: {
        name: "Song",
        artist: "Artist",
        album: "Album",
        albumArtUrl: "https://i.scdn.co/image/abcdef",
        isPlaying: true,
        currentTime: 75,
        duration: 180,
      },
      updatedAt: fixedNow.toISOString(),
    })
  })

  it("clamps a zero-duration track at zero seconds", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    server.use(
      http.get(statusUrl, () =>
        HttpResponse.json({
          discord: {
            ...discord(),
            activities: [
              spotifyActivity({
                start: fixedNow.getTime() - 5_000,
                end: fixedNow.getTime() - 5_000,
                largeImage: "https://cdn.example/album.png",
              }),
            ],
          },
        }),
      ),
    )

    const response = await app.request("/api/presence", {}, bindings)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      connection: "connected",
      discordStatus: "online",
      spotifyTrack: expect.objectContaining({
        name: "Song",
        albumArtUrl: "https://cdn.example/album.png",
        currentTime: 0,
        duration: 0,
      }),
      updatedAt: fixedNow.toISOString(),
    })
  })

  it.each([
    ["before playback starts", fixedNow.getTime() + 5_000, fixedNow.getTime() + 185_000, 0],
    ["after playback ends", fixedNow.getTime() - 185_000, fixedNow.getTime() - 5_000, 180],
  ])("clamps the current playback time %s", async (_case, start, end, expectedCurrentTime) => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    server.use(
      http.get(statusUrl, () =>
        HttpResponse.json({
          discord: {
            ...discord(),
            activities: [spotifyActivity({ start, end })],
          },
        }),
      ),
    )

    const response = await app.request("/api/presence", {}, bindings)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      spotifyTrack: {
        currentTime: expectedCurrentTime,
        duration: 180,
      },
    })
  })

  it.each([
    ["no Spotify activity", discord()],
    [
      "an activity with a non-Spotify type",
      {
        ...discord(),
        activities: [{ name: "Spotify", type: 0 }],
      },
    ],
    [
      "an incomplete Spotify activity",
      {
        ...discord(),
        activities: [{ name: "Spotify", type: 2, details: "Song", state: "Artist" }],
      },
    ],
    [
      "an offline Discord presence",
      {
        ...discord("offline"),
        activities: [
          spotifyActivity({
            start: fixedNow.getTime() - 10_000,
            end: fixedNow.getTime() + 170_000,
          }),
        ],
      },
    ],
    [
      "an insecure album image URL",
      {
        ...discord(),
        activities: [
          spotifyActivity({
            start: fixedNow.getTime() - 10_000,
            end: fixedNow.getTime() + 170_000,
            largeImage: "http://cdn.example/album.png",
          }),
        ],
      },
    ],
    [
      "reversed Spotify timestamps",
      {
        ...discord(),
        activities: [
          spotifyActivity({
            start: fixedNow.getTime() + 1_000,
            end: fixedNow.getTime(),
          }),
        ],
      },
    ],
  ])("returns no Spotify track for %s", async (_case, discordPresence) => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    server.use(
      http.get(statusUrl, () =>
        HttpResponse.json({
          discord: discordPresence,
        }),
      ),
    )

    const response = await app.request("/api/presence", {}, bindings)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      connection: "connected",
      discordStatus: discordPresence.status,
      spotifyTrack: null,
      updatedAt: fixedNow.toISOString(),
    })
  })

  it("returns presence_unavailable for malformed upstream JSON", async () => {
    server.use(http.get(statusUrl, () => HttpResponse.text("{")))

    const response = await app.request("/api/presence", {}, bindings)

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "presence_unavailable" },
    })
  })

  it("returns presence_unavailable when the Discord payload is invalid", async () => {
    server.use(
      http.get(statusUrl, () =>
        HttpResponse.json({
          discord: { ...discord(), status: "unknown" },
        }),
      ),
    )

    const response = await app.request("/api/presence", {}, bindings)

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "presence_unavailable" },
    })
  })

  it.each([
    ["network failure", () => HttpResponse.error()],
    ["HTTP failure", () => new HttpResponse(null, { status: 503 })],
  ])("returns presence_unavailable for an upstream %s", async (_case, failure) => {
    server.use(http.get(statusUrl, failure))

    const response = await app.request("/api/presence", {}, bindings)

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "presence_unavailable" },
    })
  })
})
