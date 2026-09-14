import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router"
import { ThemeProvider } from "@/components/theme-provider"
import globalStyles from "@/styles/globals.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "T4ko0522" },
      { name: "description", content: "About T4ko0522" },
      {
        name: "keywords",
        content: "T4ko0522, Portfolio, Full Stack Engineer, Japanese Developer",
      },
      { name: "author", content: "T4ko0522" },
      { name: "creator", content: "T4ko0522" },
      { property: "og:title", content: "T4ko0522" },
      { property: "og:description", content: "About T4ko0522" },
      { property: "og:url", content: "https://t4ko.pet" },
      { property: "og:site_name", content: "T4ko0522" },
      { property: "og:image", content: "https://t4ko.pet/icon.png" },
      { property: "og:image:width", content: "512" },
      { property: "og:image:height", content: "512" },
      { property: "og:image:alt", content: "T4ko0522 Profile Picture" },
      { property: "og:locale", content: "ja_JP" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "T4ko0522" },
      { name: "twitter:description", content: "About T4ko0522" },
      { name: "twitter:image", content: "https://t4ko.pet/icon.png" },
      { name: "twitter:creator", content: "@T4ko0522" },
      {
        name: "robots",
        content: "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1",
      },
    ],
    links: [
      { rel: "stylesheet", href: globalStyles },
      { rel: "canonical", href: "https://t4ko.pet/" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/icon.png" },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
