import type { ProjectDetail } from "../types/project"

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
    opacity: 0,
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
    imageUrl: "https://raw.githubusercontent.com/T4ko0522/Better-Tab/refs/heads/master/assets/image.png",
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
    title: "Custom-Readme",
    description: "GitHubプロフィール向けのREADMEをカスタマイズして生成できるWebサービスです。",
    longDescription: "Custom-Readmeは、GitHubプロフィール用のREADMEをブラウザ上でカスタマイズして生成できるWebサービスです。Next.jsで構築されたUIから設定を組み立て、プレビューしながら自分好みのREADMEを作成できます。",
    imageUrl: "/images/customr.png",
    imageAlt: "Custom-Readme Screenshot",
    url: "https://custom-readme.vercel.app",
    githubUrl: "https://github.com/T4ko0522/Custom-Readme",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    features: [
      "ブラウザ上でのREADMEカスタマイズ",
      "リアルタイムプレビュー",
      "GitHubプロフィール向けのテンプレート",
      "レスポンシブデザイン対応",
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
  },
  {
    title: "dotfiles",
    description: "Windows環境でのカスタム設定ファイル集です。",
    longDescription: "このリポジトリには、Windows 11環境でのカスタム設定ファイル集が含まれています。",
    imageUrl: "https://raw.githubusercontent.com/T4ko0522/dotfiles/refs/heads/master/image.png",
    imageAlt: "dotfiles Configuration",
    githubUrl: "https://github.com/T4ko0522/dotfiles",
    technologies: ["PowerShell", "WezTerm","WSL","starship","mise"],
    features: [
      "dotfiles",
    ],
  },
  {
    title: "Spotify-CLI",
    description: "ターミナルからSpotifyを操作できるCLI/TUIツールです。",
    longDescription: "Spotify-CLIは、Goで実装されたターミナル向けのSpotifyクライアントです。Now PlayingのTUI表示、アルバムアートのインライン描画、LRCLIB連携による同期歌詞、再生コントロール、音量調整、デバイス切り替えなどをコマンド一つで完結できます。",
    imageUrl: "https://raw.githubusercontent.com/T4ko0522/Spotify-CLI/main/assets/readme.png",
    imageAlt: "Spotify-CLI Screenshot",
    githubUrl: "https://github.com/T4ko0522/Spotify-CLI",
    technologies: ["Go", "Bubble Tea", "Spotify API", "LRCLIB", "WezTerm"],
    features: [
      "Now Playing TUIによるリアルタイム表示",
      "LRCLIB連携の同期歌詞表示",
      "再生コントロール（play/stop/next/back）",
      "音量コントロール（TUIスライダー / 直接指定）",
      "デバイス一覧と切り替え",
      "アルバムアートのサイズプリセット",
    ],
  },
  {
    title: "music-share",
    description: "音楽URLからSpotify / YouTube Musicの双方向リンクを返すDiscord Botです。",
    longDescription: "music-shareは、Discord上でBotへのメンションと音楽URLを受け取り、対象曲を特定してSpotifyとYouTube Musicのリンクを整形して返信するBotです。サービス間の楽曲共有を1メッセージで完結させ、メタデータ照合と結果キャッシュにより安定した変換を提供します。",
    imageUrl: "https://raw.githubusercontent.com/T4ko0522/music-share/master/assets/example.png",
    imageAlt: "music-share Screenshot",
    githubUrl: "https://github.com/T4ko0522/music-share",
    technologies: ["TypeScript", "Node.js", "Discord.js", "Spotify API", "YouTube Music"],
    features: [
      "Spotify ⇔ YouTube Music の双方向リンク変換",
      "メンション + URL のシンプルなインターフェース",
      "URLパースとサービス自動判定",
      "メタデータ照合とスコアリングによるマッチング",
      "TTLキャッシュによるレスポンス最適化",
    ],
  }
]
