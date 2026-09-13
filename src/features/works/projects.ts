export interface ProjectDetail {
  title: string
  description: string
  longDescription?: string
  imageUrl: string
  imageAlt: string
  url?: string
  githubUrl?: string
  technologies?: string[]
  features?: string[]
}

export const projectDetails: ProjectDetail[] = [
  {
    title: "Unframe",
    description: "未踏ジュニアで採択された、MRプレゼンテーションアプリ",
    imageUrl: "/images/unframe.png",
    imageAlt: "Unframe",
    url: "https://un-fra.me/",
    githubUrl: "https://github.com/unframe-dev",
  },
  {
    title: "cf-edgeNix",
    description: "NixOSのBinary Cache基盤をCloudflare Nativeに構築したサービスです。",
    imageUrl: "/images/cf-edgeNix.png",
    imageAlt: "cf-edgeNix",
    url: "https://nix.t4ko.pet/",
    githubUrl: "https://github.com/T4ko0522/cf-edgeNix",
  },
  {
    title: "Cloudflare Workers Tech Talks in Kyoto #2",
    description: "Cloudflare Workers Tech Talks in Kyoto #2 に登壇しました。",
    imageUrl: "/images/cf-wrks-kyoto-2.png",
    imageAlt: "Cloudflare Workers Tech Talks in Kyoto #2",
    url: "https://workers-tech.connpass.com/event/397441/",
  },
  {
    title: "Hono",
    description: "HonoにContributionしていました。",
    imageUrl: "/images/hono.png",
    imageAlt: "Hono",
    githubUrl: "https://github.com/honojs/hono",
  },
  {
    title: "Spotify-CLI",
    description: "ターミナルからSpotifyを操作できるCLI/TUIツールです。",
    imageUrl: "https://raw.githubusercontent.com/T4ko0522/Spotify-CLI/main/assets/readme.png",
    imageAlt: "Spotify-CLI Screenshot",
    githubUrl: "https://github.com/T4ko0522/Spotify-CLI",
  },
  {
    title: "Portfolio",
    description:
      "このポートフォリオサイトです。ReactとTailwind CSS、Framer Motionを使用したデザインです。",
    imageUrl: "/images/Portfolio.png",
    imageAlt: "Portfolio",
    url: "https://t4ko.pet/",
    githubUrl: "https://github.com/T4ko0522/Portfolio",
  },
]
