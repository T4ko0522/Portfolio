import { z } from "zod"

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    issues: z.record(z.string(), z.array(z.string())).optional(),
  }),
})

export function apiError(code: string, message: string) {
  return { error: { code, message } }
}
