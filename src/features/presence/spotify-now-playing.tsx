"use client"

import { motion } from "framer-motion"
import Image from "@/components/ui/image"
import { Music } from "lucide-react"
import type { SpotifyTrack, PresenceState } from "@/features/presence/types"

interface SpotifyNowPlayingProps {
  track?: SpotifyTrack
  isLoading?: boolean
  connection?: PresenceState["presenceConnection"]
}

export default function SpotifyNowPlaying({
  track,
  isLoading = false,
  connection = "connected",
}: SpotifyNowPlayingProps) {
  // trackが存在しない場合
  if (!track) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 w-full max-w-[300px]"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-transparent backdrop-blur-sm border border-white/10 transition-all duration-300 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center gap-2">
            {/* Spotifyロゴ */}
            <svg
              className="w-4 h-4 text-green-500 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
            </svg>
            <p className="text-xs text-white font-medium">
              {connection === "connecting"
                ? "connecting…"
                : connection === "connected"
                  ? "nothing right now"
                  : "status unavailable"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // trackが存在するが再生されていない場合
  if (!track.isPlaying) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 w-full max-w-[300px]"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-transparent backdrop-blur-sm border border-white/10 transition-all duration-300 rounded-2xl p-5 shadow-lg"
        >
          <div className="flex items-center gap-2">
            {/* Spotifyロゴ */}
            <svg
              className="w-4 h-4 text-green-500 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
            </svg>
            <p className="text-xs text-gray-400 font-medium">nothing right now</p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  const currentTrack = track

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 w-full max-w-[300px]"
      >
        <div className="bg-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-700 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded-full animate-pulse w-3/4" />
              <div className="h-3 bg-gray-700 rounded-full animate-pulse w-1/2" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-6 w-full max-w-[300px]"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-transparent backdrop-blur-sm border border-white/10 transition-all duration-300 rounded-2xl p-5 shadow-lg"
      >
        <div className="flex items-center gap-4">
          {/* アルバムアート */}
          <div className="relative w-14 h-14 flex-shrink-0 rounded-full overflow-hidden shadow-md ring-2 ring-white/10">
            {currentTrack.albumArtUrl ? (
              <Image
                src={currentTrack.albumArtUrl}
                alt={`${currentTrack.album} cover`}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <Music className="w-7 h-7 text-gray-400" />
              </div>
            )}
          </div>

          {/* 曲情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {/* Spotifyロゴ */}
              <svg
                className="w-4 h-4 text-green-500 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
              </svg>
              <p className="text-xs text-gray-400 font-medium">Now playing</p>
            </div>
            <a
              href={currentTrack.spotifyUrl ?? "https://open.spotify.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <p className="text-sm font-semibold text-white truncate group-hover:text-green-400 transition-colors">
                {currentTrack.name}
              </p>
              <p className="text-xs text-gray-300 truncate mt-0.5">{currentTrack.artist}</p>
              {currentTrack.currentTime !== undefined && currentTrack.duration !== undefined && (
                <div className="mt-3">
                  <progress
                    aria-label="再生位置"
                    value={currentTrack.currentTime}
                    max={Math.max(1, currentTrack.duration)}
                    className="block h-1 w-full accent-green-400"
                  />
                  <p className="mt-1 text-[10px] text-white/50 tabular-nums">
                    {formatTime(currentTrack.currentTime)} / {formatTime(currentTrack.duration)}
                  </p>
                </div>
              )}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`
}
