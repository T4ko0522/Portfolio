import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(1, '名前を入力してください').max(50, '名前は50文字以内で入力してください'),
  email: z
    .string()
    .trim()
    .min(1, 'メールアドレスを入力してください')
    .max(254, 'メールアドレスが長すぎます')
    .email('有効なメールアドレスを入力してください'),
  subject: z.string().trim().min(1, '件名を入力してください').max(100, '件名は100文字以内で入力してください'),
  message: z
    .string()
    .trim()
    .min(10, '本文は10文字以上で入力してください')
    .max(2_000, '本文は2000文字以内で入力してください'),
  website: z.string().optional(),
  turnstileToken: z.string().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>
