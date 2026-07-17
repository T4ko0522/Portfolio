"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/card";
import { Gift, Code } from "lucide-react";
import SpotifyNowPlaying from "./spotify-now-playing";
import { BirthdayCountdown, BirthdayCelebration } from "./birthday-countdown";
import type { SpotifyTrack } from "../types/spotify";

const MobileAbout = dynamic<{
  daysUntilBirthday: number;
  discordStatus?: string | null;
}>(() => import("./mobile/about"), { ssr: false });

interface AboutSectionProps {
  isMobile: boolean;
  daysUntilBirthday: number;
  discordStatus: "online" | "idle" | "dnd" | "offline" | null;
  spotifyTrack: SpotifyTrack | null;
  isSpotifyLoading: boolean;
}

export default function AboutSection({
  isMobile,
  daysUntilBirthday,
  discordStatus,
  spotifyTrack,
  isSpotifyLoading,
}: AboutSectionProps) {
  if (isMobile) {
    return (
      <div className="min-h-screen container mx-auto px-4 max-w-6xl flex items-start justify-center pt-20 pb-28">
        <MobileAbout
          daysUntilBirthday={daysUntilBirthday}
          discordStatus={discordStatus}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 max-w-6xl flex items-center justify-center py-16">
      <div className="flex flex-row items-center gap-8 lg:gap-12 w-full">
        {/* 左側: アイコン */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            type: "spring",
            bounce: 0.4,
            delay: 0.1,
          }}
          className="flex-shrink-0 flex flex-col items-center"
        >
          <div className="relative w-[300px] h-[240px] lg:w-[400px] lg:h-[320px] flex items-center justify-center">
            <Image
              src="https://cdn.discordapp.com/media/v1/collectibles-shop/1306330663070334996/animated"
              alt="Decoration"
              width={256}
              height={256}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              style={{ width: "248px", height: "248px" }}
              draggable="false"
              unoptimized
            />
            {discordStatus && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 lg:w-64 lg:h-64 pointer-events-none z-[60]"
                aria-hidden
              >
                <div
                  className="absolute bottom-3 right-7"
                  style={{
                    width: "28px",
                    height: "28px",
                    filter: "drop-shadow(0 0 0 3px #1a1a1a)",
                  }}
                >
                  {discordStatus === "online" ? (
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 12 12"
                      className="w-full h-full"
                    >
                      <circle cx="6" cy="6" r="6" fill="rgb(69, 163, 102)" />
                    </svg>
                  ) : discordStatus === "idle" ? (
                    <svg
                      width="28"
                      height="28"
                      viewBox="2 2 20 20"
                      className="w-full h-full"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 17C10.952 18.6176 16.6829 8.75775 11 3C16.0007 3.13144 20 7.11149 20 12C20 16.9715 16.1188 21 11 21C7.77111 21 4.65938 19.4319 3 17Z"
                        fill="#ffc04e"
                        stroke="#ffc04e"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : discordStatus === "dnd" ? (
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 12 12"
                      className="w-full h-full"
                    >
                      <circle cx="6" cy="6" r="6" fill="rgb(237, 66, 69)" />
                      <rect
                        x="2"
                        y="5"
                        width="8"
                        height="2"
                        fill="black"
                        rx="1"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 12 12"
                      className="w-full h-full"
                    >
                      <circle cx="6" cy="6" r="6" fill="rgb(116, 127, 141)" />
                      <circle cx="6" cy="6" r="4" fill="rgb(79, 84, 92)" />
                    </svg>
                  )}
                </div>
              </div>
            )}
            <motion.div className="w-52 h-52 lg:w-64 lg:h-64 rounded-full overflow-visible relative z-40">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="Tako"
                  fill
                  sizes="(max-width: 1024px) 208px, 256px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 text-center"
          >
            <a
              href="https://discord.gg/JP7uwGDv5T"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mb-2 transition-transform duration-200 ease-out hover:scale-105 cursor-pointer"
            >
              <h2
                className="text-4xl lg:text-5xl font-bold text-white"
                style={{ fontFamily: "Discord, sans-serif" }}
              >
                T4ko
              </h2>
              <div className="flex items-center gap-1.5 border border-white/30 rounded px-2 py-0.5">
                <Image
                  src="https://cdn.discordapp.com/clan-badges/595317990191398933/5607047f21b7e25a26c195cc49871278.png"
                  alt="Clan Badge"
                  width={16}
                  height={16}
                  className="w-4 h-4"
                />
                <span className="text-xs lg:text-sm font-bold text-white">
                  CF
                </span>
              </div>
            </a>
            <p className="text-base lg:text-lg text-gray-300 mb-1">
              tako._.v<span className="font-bold">・</span>18yo He/Him
            </p>
          </motion.div>
          <SpotifyNowPlaying
            track={spotifyTrack || undefined}
            isLoading={isSpotifyLoading}
          />
        </motion.div>

        {/* 右側: About Me */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.8,
            type: "spring",
            bounce: 0.4,
            delay: 0.2,
          }}
          className="flex-1"
        >
          <Card className="bg-transparent border-transparent">
            <CardContent className="p-6">
              <h3 className="text-2xl lg:text-3xl font-bold mb-6 text-cyan-300">
                💻 About Me
              </h3>
              <p className="mb-4 text-white text-lg">
                <span className="font-bold">
                  Full-Stack Engineer | Software Developer
                </span>
              </p>
              <p className="mb-6 text-white">
                2008年5月22日 大阪府生誕！
                <br />
                現在はWeb開発を中心に学習しており、バックエンドとフロントエンドの両方を扱えるフルスタックエンジニアです！
                <span className="block text-sm italic text-gray-200 mt-2">
                  Born on May 22 2008, in Osaka Prefecture.
                  <br />
                  Currently studying web development and is a full-stack
                  engineer capable of both back-end and front-end development.
                </span>
              </p>
              <div className="grid grid-cols-1 gap-4">
                {/* 誕生日 */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-transparent backdrop-blur-sm border border-white/10 transition-all duration-300 rounded-2xl p-5 shadow-lg text-white"
                >
                  <div className="flex items-center mb-2">
                    <Gift className="w-5 h-5 text-white mr-2" />
                    <h4 className="text-lg font-medium text-white">Birthday</h4>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-xl font-bold text-gray-200">
                      May 22nd
                    </span>
                    {daysUntilBirthday > 0 && (
                      <span className="ml-2 text-sm text-gray-200">
                        ({daysUntilBirthday} days left)
                      </span>
                    )}
                    {daysUntilBirthday === 0 && (
                      <span className="ml-2 text-sm text-green-400 font-bold animate-pulse">
                        Today! 🎉
                      </span>
                    )}
                  </div>
                </motion.div>
                {/* Skills */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-transparent backdrop-blur-sm border border-white/10 transition-all duration-300 rounded-2xl p-5 shadow-lg text-white"
                >
                  <div className="flex items-center mb-4">
                    <Code className="w-5 h-5 text-white mr-2" />
                    <h4 className="text-lg font-medium text-white">Skills</h4>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="https://skillicons.dev/icons?i=js,ts,go,python,lua,bash,powershell"
                      alt="Languages"
                      className="h-auto"
                    />
                    <img
                      src="https://skillicons.dev/icons?i=react,vue,astro,next,nuxt,remix,tailwind,materialui,express,nest,vite,vitest,nodejs,deno"
                      alt="Frameworks"
                      className="h-auto"
                    />
                    <img
                      src="https://skillicons.dev/icons?i=linux,gcp,vercel,docker,kubernetes,postgres,mysql"
                      alt="Infrastructure"
                      className="h-auto"
                    />
                  </div>
                </motion.div>
              </div>

              {/* 誕生日カウントダウン */}
              {daysUntilBirthday <= 30 && daysUntilBirthday > 0 && (
                <BirthdayCountdown daysUntilBirthday={daysUntilBirthday} />
              )}

              {/* 誕生日アニメーション */}
              {daysUntilBirthday === 0 && <BirthdayCelebration />}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
