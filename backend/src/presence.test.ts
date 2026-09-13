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
          discord: discord(),
          spotify: {
            trackId: "track-id",
            trackName: "Song",
            artistName: "Artist",
            albumName: "Album",
            albumArt: "spotify:abcdef",
            duration: 180_000,
            position: 70_000,
            isPlaying: true,
            timestamp: fixedNow.getTime() - 5_000,
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
          discord: discord(),
          spotify: {
            trackName: "Song",
            artistName: "Artist",
            albumName: "Album",
            albumArt: "https://cdn.example/album.png",
            duration: 0,
            position: 10_000,
            isPlaying: true,
            timestamp: fixedNow.getTime() - 5_000,
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
    ["no Spotify payload", discord(), undefined],
    [
      "a stopped track",
      discord(),
      {
        trackName: "Song",
        artistName: "Artist",
        albumName: "Album",
        albumArt: "spotify:abcdef",
        duration: 180_000,
        position: 10_000,
        isPlaying: false,
        timestamp: fixedNow.getTime(),
      },
    ],
    [
      "an incomplete track",
      discord(),
      {
        trackName: "Song",
        artistName: "Artist",
        albumName: "Album",
        isPlaying: true,
      },
    ],
    [
      "an offline Discord presence",
      discord("offline"),
      {
        trackName: "Song",
        artistName: "Artist",
        albumName: "Album",
        albumArt: "spotify:abcdef",
        duration: 180_000,
        position: 10_000,
        isPlaying: true,
        timestamp: fixedNow.getTime(),
      },
    ],
  ])("returns no Spotify track for %s", async (_case, discordPresence, spotify) => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    server.use(
      http.get(statusUrl, () =>
        HttpResponse.json({
          discord: discordPresence,
          ...(spotify ? { spotify } : {}),
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
