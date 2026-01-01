import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "../components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "T4ko0522",
  description:
    "About T4ko0522",
  metadataBase: new URL("https://t4ko.vercel.app"),
  openGraph: {
    title: "T4ko0522",
    description:
      "About T4ko0522",
    url: "https://t4ko.vercel.app",
    siteName: "T4ko0522",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
