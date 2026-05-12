"use client"

import { ExternalLink } from "lucide-react"
import Image from "next/image"
import type { ProjectDetail } from "../../types/project"

interface WorksProps {
  projects: ProjectDetail[]
}

export default function Works({ projects }: WorksProps) {
  return (
    <div className="w-full flex flex-col gap-5 px-3">
      {projects.map((project) => (
        <MobileProjectCard key={project.title} project={project} />
      ))}
    </div>
  )
}

function MobileProjectCard({ project }: { project: ProjectDetail }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-950">
        {project.imageUrl && (
          <Image
            src={project.imageUrl}
            alt={project.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
            draggable={false}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
      </div>

      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="truncate text-base font-semibold text-white">{project.title}</h4>
          <div className="flex shrink-0 items-center gap-1.5">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${project.title}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-cyan-300"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} on GitHub`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <p className="text-sm leading-relaxed text-gray-400">
          {project.description}
        </p>
      </div>
    </div>
  )
}
