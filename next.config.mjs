/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      unoptimized: true,
    },
    // Next.js 15の新しい設定
    logging: {
      fetches: {
        fullUrl: process.env.NODE_ENV === 'development',
      },
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  };
  
  export default nextConfig;
  