import { hc } from "hono/client"
import type { AppType } from "../../backend/src/app"

export const apiClient = hc<AppType>(import.meta.env.PROD ? "https://api.t4ko.pet" : "/")
