import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { bodyLimit } from "hono/body-limit"
import { z } from "zod"
import { contactSchema } from "../../shared/contact"
import { apiError } from "../../shared/api-error"
import type { BackendBindings } from "./env"

const verificationSchema = z.object({ success: z.boolean() })
const timeout = () => AbortSignal.timeout(10_000)

export const contactRoutes = new Hono<{ Bindings: BackendBindings }>().post(
  "/contact",
  bodyLimit({
    maxSize: 16 * 1024,
    onError: (c) => c.json(apiError("payload_too_large", "送信内容が大きすぎます。"), 413),
  }),
  async (c, next) => {
    if (c.req.header("content-type")?.split(";")[0].trim() !== "application/json") {
      return c.json(apiError("unsupported_media_type", "JSON 形式で送信してください。"), 415)
    }
    await next()
  },
  zValidator("json", contactSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: {
            code: "validation_error",
            message: "入力内容をご確認ください。",
            issues: z.flattenError(result.error).fieldErrors,
          },
        },
        400,
      )
    }
  }),
  async (c) => {
    const { website, turnstileToken, ...contact } = c.req.valid("json")
    if (website?.trim()) return c.json({ ok: true }, 200)

    const { CONTACT_DISCORD_WEBHOOK_URL: webhook, TURNSTILE_SECRET_KEY: secret } = c.env
    if (!webhook || !secret || !c.env.CONTACT_RATE_LIMITER) {
      return c.json(apiError("not_configured", "送信機能が設定されていません。"), 503)
    }
    const ip = c.req.header("cf-connecting-ip")
    const { success } = await c.env.CONTACT_RATE_LIMITER.limit({ key: ip ?? "unknown" })
    if (!success) {
      c.header("Retry-After", "60")
      return c.json(apiError("rate_limited", "時間をおいてから再度お試しください。"), 429)
    }
    if (!turnstileToken) {
      return c.json(apiError("verification_failed", "スパム認証を完了してください。"), 400)
    }

    try {
      const body = new URLSearchParams({ secret, response: turnstileToken })
      if (ip) body.set("remoteip", ip)
      const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body,
        signal: timeout(),
      })
      const verification = response.ok ? verificationSchema.safeParse(await response.json()) : null
      if (!verification?.success || !verification.data.success) {
        return c.json(apiError("verification_failed", "スパム認証に失敗しました。"), 400)
      }
    } catch {
      return c.json(apiError("verification_failed", "スパム認証に失敗しました。"), 400)
    }

    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Portfolio Contact",
          allowed_mentions: { parse: [] },
          embeds: [
            {
              title: `[Portfolio] ${contact.subject}`,
              description: contact.message,
              color: 0x5865f2,
              fields: [
                { name: "Name", value: contact.name, inline: true },
                { name: "Email", value: contact.email, inline: true },
              ],
            },
          ],
        }),
        signal: timeout(),
      })
      if (!response.ok) throw new Error("Contact delivery rejected")
      return c.json({ ok: true }, 200)
    } catch {
      return c.json(
        apiError("delivery_failed", "送信に失敗しました。時間をおいて再度お試しください。"),
        502,
      )
    }
  },
)
