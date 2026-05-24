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
  keywords: [
    "T4ko0522",
    "Portfolio",
    "Full Stack Engineer",
    "Japanese Developer",
  ],
  authors: [{ name: "T4ko0522" }],
  creator: "T4ko0522",
  metadataBase: new URL("https://t4ko.pet"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "T4ko0522",
    description:
      "About T4ko0522",
    url: "https://t4ko.pet",
    siteName: "T4ko0522",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "T4ko0522 Profile Picture",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "T4ko0522",
    description:
      "About T4ko0522",
    images: ["/icon.png"],
    creator: "@T4ko0522",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: "/icon.png",
  },
}

export const viewport: Viewport = {
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
