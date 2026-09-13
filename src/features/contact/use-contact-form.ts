import { useState, type FormEvent } from "react"
import { contactSchema } from "./contact-schema"

export type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string[]>>

export function useContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [status, setStatus] = useState<"idle" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    const result = contactSchema.safeParse({
      name,
      email,
      subject,
      message,
      website,
      turnstileToken,
    })
    setStatus("error")
    if (!result.success) {
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
    setErrorMessage("現在フォームからの送信は準備中です。下記のメールアドレスからご連絡ください。")
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
    status,
    errorMessage,
    fieldErrors,
    handleSubmit,
  }
}
