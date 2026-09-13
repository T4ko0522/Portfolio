import { Hono } from "hono"
import { cors } from "hono/cors"
import { HTTPException } from "hono/http-exception"
import { apiError } from "../../shared/api-error"
import type { BackendBindings } from "./env"
import { contactRoutes } from "./contact"
import { presenceRoutes } from "./presence"

export const app = new Hono<{ Bindings: BackendBindings }>()
  .use(
    "/api/*",
    cors({
      origin: ["https://t4ko.pet", "https://www.t4ko.pet"],
      allowMethods: ["GET", "POST"],
      allowHeaders: ["Content-Type"],
      maxAge: 600,
    }),
  )
  .use("*", async (c, next) => {
    c.header("Cache-Control", "no-store")
    c.header("X-Content-Type-Options", "nosniff")
    await next()
  })
  .onError((error, c) => {
    if (error instanceof HTTPException && error.status === 400) {
      return c.json(apiError("invalid_request", "リクエストの形式が正しくありません。"), 400)
    }
    return c.json(apiError("internal_error", "処理に失敗しました。"), 500)
  })
  .notFound((c) => c.json(apiError("not_found", "API が見つかりません。"), 404))
  .get("/api/health", (c) => c.json({ ok: true }, 200))
  .route("/api", contactRoutes)
  .route("/api", presenceRoutes)

export type AppType = typeof app
export default app
