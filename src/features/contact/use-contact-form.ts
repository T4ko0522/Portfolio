import { useRef, useState, type FormEvent } from "react"
import type { TurnstileInstance } from "@marsidev/react-turnstile"
import { contactSchema } from "../../../shared/contact"
import { apiErrorSchema } from "../../../shared/api-error"
import { apiClient } from "@/lib/api-client"

export type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string[]>>

export function useContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const submitting = useRef(false)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    setFieldErrors({})
    const result = contactSchema.safeParse({
      name,
      email,
      subject,
      message,
      website,
      turnstileToken,
    })
    if (!result.success) {
      setStatus("error")
      const errors = result.error.flatten().fieldErrors
      setErrorMessage("入力内容をご確認ください。")
      setFieldErrors({
        name: errors.name,
        email: errors.email,
        subject: errors.subject,
        message: errors.message,
      })
      return
    }
    submitting.current = true
    setStatus("submitting")
    setErrorMessage("")
    try {
      const response = await apiClient.api.contact.$post(
        { json: result.data },
        { init: { signal: AbortSignal.timeout(25_000) } },
      )
      const body: unknown = await response.json()
      if (!response.ok) {
        const error = apiErrorSchema.safeParse(body)
        if (error.success) {
          setFieldErrors(error.data.error.issues ?? {})
          throw new Error(error.data.error.message)
        }
        throw new Error("送信に失敗しました。時間をおいて再度お試しください。")
      }
      if (!body || typeof body !== "object" || !("ok" in body) || body.ok !== true) {
        throw new Error("送信結果を確認できませんでした。")
      }
      setStatus("success")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setWebsite("")
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "送信に失敗しました。")
    } finally {
      submitting.current = false
      setTurnstileToken("")
      turnstileRef.current?.reset()
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    subject,
    setSubject,
    message,
    setMessage,
    website,
    setWebsite,
    setTurnstileToken,
    turnstileRef,
    status,
    errorMessage,
    fieldErrors,
    handleSubmit,
  }
}
