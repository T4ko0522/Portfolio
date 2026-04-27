"use client"

import { Turnstile } from "@marsidev/react-turnstile"
import { motion } from "framer-motion"
import { useState, type FormEvent } from "react"

type Status = "idle" | "submitting" | "success" | "error"

type FieldErrors = Partial<Record<"name" | "email" | "subject" | "message", string[]>>

interface ContactFormProps {
  variant?: "desktop" | "mobile"
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function ContactForm({ variant = "desktop" }: ContactFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [website, setWebsite] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const isCompact = variant === "mobile"

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMessage("")
    setFieldErrors({})

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website, turnstileToken }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus("error")
        setErrorMessage(typeof data.error === "string" ? data.error : "送信に失敗しました。")
        if (data.issues && typeof data.issues === "object") {
          setFieldErrors(data.issues as FieldErrors)
        }
        return
      }

      setStatus("success")
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      setTurnstileToken("")
    } catch {
      setStatus("error")
      setErrorMessage("ネットワークエラーが発生しました。接続を確認してください。")
    }
  }

  const labelClass = "block text-[10px] tracking-[0.3em] uppercase text-white/40 font-light"
  const fieldNumberClass = "font-serif text-white/30 mr-3 select-none"
  const inputClass =
    "w-full bg-transparent border-0 border-b border-white/15 focus:border-white/70 focus:outline-none text-white placeholder:text-white/25 py-2 text-base font-light tracking-wide transition-colors"
  const errorClass = "text-[11px] text-red-300/70 mt-1 tracking-wide font-light"

  const renderFieldError = (key: keyof FieldErrors) => {
    const errors = fieldErrors[key]
    if (!errors || errors.length === 0) return null
    return <p className={errorClass}>{errors[0]}</p>
  }

  const fields = [
    { num: "01", label: "Name", value: name, set: setName, key: "name" as const, type: "text", placeholder: "Your name" },
    { num: "02", label: "Email", value: email, set: setEmail, key: "email" as const, type: "email", placeholder: "you@example.com" },
    { num: "03", label: "Subject", value: subject, set: setSubject, key: "subject" as const, type: "text", placeholder: "What's this about?" },
  ]

  return (
    <form onSubmit={handleSubmit} className="w-full" noValidate>
      {/* Honeypot field */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden" tabIndex={-1}>
        <label>
          Website (do not fill)
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className={isCompact ? "space-y-5" : "space-y-6"}>
        {fields.map((f) => (
          <motion.div key={f.key} variants={itemVariants}>
            <div className={isCompact ? "flex items-baseline mb-1.5" : "flex items-baseline mb-2"}>
              <span className={fieldNumberClass}>{f.num}</span>
              <label htmlFor={`contact-${f.key}`} className={labelClass}>
                {f.label}
              </label>
            </div>
            <input
              id={`contact-${f.key}`}
              type={f.type}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className={inputClass}
              placeholder={f.placeholder}
              disabled={status === "submitting"}
              required
            />
            {renderFieldError(f.key)}
          </motion.div>
        ))}

        <motion.div variants={itemVariants}>
          <div className={isCompact ? "flex items-baseline mb-1.5" : "flex items-baseline mb-2"}>
            <span className={fieldNumberClass}>04</span>
            <label htmlFor="contact-message" className={labelClass}>
              Message
            </label>
          </div>
          <textarea
            id="contact-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-none ${isCompact ? "min-h-[100px]" : "min-h-[120px]"}`}
            placeholder="お問い合わせ内容をご記入ください..."
            disabled={status === "submitting"}
            required
          />
          {renderFieldError("message")}
        </motion.div>

        {siteKey ? (
          <motion.div variants={itemVariants} className="pt-2">
            <Turnstile
              siteKey={siteKey}
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken("")}
              onExpire={() => setTurnstileToken("")}
              options={{ theme: "dark", size: isCompact ? "flexible" : "normal" }}
            />
          </motion.div>
        ) : null}

        <motion.div
          variants={itemVariants}
          className={`pt-2 flex ${isCompact ? "flex-col gap-3" : "items-center justify-between gap-6"}`}
        >
          <div className={`text-[11px] tracking-wide font-light ${isCompact ? "order-2" : ""}`}>
            {status === "submitting" && <span className="text-white/50">Sending message...</span>}
            {status === "success" && <span className="text-emerald-300/80">— Message sent. Thank you.</span>}
            {status === "error" && errorMessage && <span className="text-red-300/70">— {errorMessage}</span>}
            {status === "idle" && <span className="text-white/30">All replies are personal.</span>}
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className={`group relative inline-flex items-center justify-center gap-3 border border-white/30 hover:border-white text-white px-8 py-3 text-[11px] tracking-[0.3em] uppercase font-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isCompact ? "w-full order-1" : ""}`}
          >
            <span>{status === "submitting" ? "Sending" : "Send Message"}</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </button>
        </motion.div>
      </div>
    </form>
  )
}
