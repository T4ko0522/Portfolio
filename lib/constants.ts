import type { ProjectDetail } from "../components/project-detail-modal"

export const BIRTH_MONTH = 5
export const BIRTH_DAY = 22
export const TOTAL_PAGES = 4

export const introTexts = [
  "VRChatter.",
  "Full-Stack Engineer.",
  "Software Developer.",
  "\"Araiguma\" community founder.",
]

export const sectionBackgrounds = [
  {
    type: "image" as const,
    image: "/images/Background1.png",
    position: "center 95%",
    filter: "grayscale(0.0) blur(3px)",
  },
]

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
    opacity: 0.3,
    x: direction === 1 ? "-100%" : "100%",
  }),
}

export const pageTransition = {
  duration: 0.6,
  ease: [0.4, 0.0, 0.2, 1],
}

export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
}

export const projectDetails: ProjectDetail[] = [
  {
    title: "better-tab",
    description: "カスタマイズ可能なブラウザの新規タブページです。",
    longDescription: "better-tabは、カスタマイズ可能な新しいタブページ。時計、天気、カレンダー、トレンド記事を一つのページに集約した、モダンで使いやすい新しいタブ用のページです。",
    imageUrl: "/images/Better-Tab.png",
    imageAlt: "better-tab Screenshot",
    url: "https://better-tab.vercel.app",
    githubUrl: "https://github.com/T4ko0522/better-tab",
    technologies: ["Next.js", "TypeScript", "Chrome Extension", "Tailwind CSS"],
    features: [
      "カスタマイズ可能な新規タブページ",
      "クイックアクセスリンク",
      "天気情報の表示",
      "カレンダーの表示",
      "トレンド記事の表示",
    ],
  },
  {
    title: "contributions-status",
    description: "GitHub, GitLabのコントリビューショングラフを統合して画像で返すサービスです。",
    longDescription: "contributions-statusは、GitHubとGitLabのコントリビューションを統合してグラフとしてカスタマイズして画像をpng形式でapiとして返すサービスです。デフォルトの緑色のグラフではなく、様々なテーマやカラースキームを選択できます。apiにsearch queryとして埋め込んで画像として出力されるため、READMEやポートフォリオサイトに簡単に埋め込むことができます。",
    imageUrl: "/images/Contribution.png",
    imageAlt: "contributions-status Screenshot",
    url: "https://contributions-status.vercel.app",
    githubUrl: "https://github.com/T4ko0522/contributions-status",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    features: [
      "GitHub, GitLabのコントリビューションを統合してグラフとして返す",
      "png形式での出力",
      "カスタムカラースキームの設定",
      "GitHub APIとの連携",
    ],
  },
  {
    title: "Portfolio",
    description: "このポートフォリオサイトです。Next.jsとTailwind CSSとshadcn/uiとFramer Motionを使用したモダンなデザインです。",
    longDescription: "このポートフォリオサイトは、Next.js、TypeScript、Tailwind CSS、Framer Motionを使用して構築されています。アニメーション効果やレスポンシブデザインを実装し、プロジェクトの詳細情報をモーダルで表示する機能など、モダンなWeb開発のベストプラクティスを取り入れています。",
    imageUrl: "/images/Portfolio.png",
    imageAlt: "Portfolio Screenshot",
    url: "https://t4ko.vercel.app",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Framer Motion"],
    features: [
      "レスポンシブデザイン",
      "Framer Motionによるアニメーション",
      "プロジェクト詳細モーダル",
      "ダークテーマ対応",
      "ローディングスクリーン",
    ],
  },
  {
    title: "dotfiles",
    description: "Windows環境でのカスタム設定ファイル集です。",
    longDescription: "このリポジトリには、Windows 11環境でのカスタム設定ファイル集が含まれています。",
    imageUrl: "/images/Terminal.png",
    imageAlt: "dotfiles Configuration",
    url: "https://github.com/T4ko0522/dotfiles",
    technologies: ["PowerShell", "WezTerm","WSL","starship","mise"],
    features: [
      "dotfiles",
    ],
  },
  {
    title: "Connectix2",
    description: "VRChatのステータスをリアルタイムで更新できるSNSプロフィールサービスです。",
    longDescription: "Connectix2は、VRChatユーザー向けのSNSプロフィールサービスです。VRChatのステータス（オンライン/オフライン、ワールド情報など）をリアルタイムで取得し、プロフィールページに表示します。ユーザーは自分のプロフィールをカスタマイズでき、他のユーザーと繋がることができます。",
    imageUrl: "/images/Connectix2.png",
    imageAlt: "Connectix2 Screenshot",
    url: "https://cntx.in",
    githubUrl: "https://github.com/T4ko0522/Connectix2",
    technologies: ["Next.js", "TypeScript", "React", "Tailwind CSS", "Vercel"],
    features: [
      "VRChat APIとの連携によるリアルタイムステータス表示",
      "カスタマイズ可能なプロフィールページ",
      "ユーザー間のフォロー機能",
      "レスポンシブデザイン対応",
    ],
  }
]
