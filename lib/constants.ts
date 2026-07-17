import type { ProjectDetail } from "../types/project";

export const BIRTH_MONTH = 5;
export const BIRTH_DAY = 22;

export const introTexts = [
  "VRChatter.",
  "Full-Stack Engineer.",
  "Software Developer.",
  '"Araiguma" community founder.',
];

export const sectionBackgrounds = [
  {
    type: "image" as const,
    image: "/images/background.webp",
    position: "center 95%",
    filter: "grayscale(0.0) blur(3px)",
  },
];

export const pageVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction === 1 ? "100%" : "-100%",
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction === 1 ? "-100%" : "100%",
  }),
};

export const pageTransition = {
  duration: 0.6,
  ease: [0.4, 0.0, 0.2, 1],
};

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
    description:
      "NixOSのBinary Cache基盤をCloudflare Nativeに構築したサービスです。",
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
    imageUrl:
      "https://raw.githubusercontent.com/T4ko0522/Spotify-CLI/main/assets/readme.png",
    imageAlt: "Spotify-CLI Screenshot",
    githubUrl: "https://github.com/T4ko0522/Spotify-CLI",
  },
  {
    title: "Portfolio",
    description:
      "このポートフォリオサイトです。Next.jsとTailwind CSSとshadcn/uiとFramer Motionを使用したモダンなデザインです。",
    imageUrl: "/images/Portfolio.png",
    imageAlt: "Portfolio",
    url: "https://t4ko.pet/",
    githubUrl: "https://github.com/T4ko0522/Portfolio",
  },
];
