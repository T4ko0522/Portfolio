import { Hono } from "hono"
import { apiError } from "../../shared/api-error"
import type { BackendBindings } from "./env"
import { fetchStatusJson } from "./status-json"

export const presenceRoutes = new Hono<{ Bindings: BackendBindings }>().get(
  "/presence",
  async (c) => {
    try {
      return c.json(await fetchStatusJson(), 200)
    } catch {
      return c.json(apiError("presence_unavailable", "接続状態を取得できません。"), 502)
    }
  },
)
