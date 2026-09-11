import { DurableObject } from "cloudflare:workers"
import handler, { createServerEntry } from "@tanstack/react-start/server-entry"

/**
 * Keeps the existing Durable Object namespace deployable while its data
 * lifecycle is decided. The frontend no longer binds to or calls this class.
 */
export class SpotifyStatusDO extends DurableObject<CloudflareEnv> {
  override async alarm() {}
}

export default createServerEntry({
  fetch(request) {
    return handler.fetch(request)
  },
})
