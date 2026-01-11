"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import { ProjectDetail } from "./project-detail-modal"

interface MobileWorksProps {
  projects: ProjectDetail[]
  onProjectClick: (project: ProjectDetail) => void
}

export default function MobileWorks({ projects, onProjectClick }: MobileWorksProps) {
  // Connectix2とBetter-tabのみをフィルタリング
  const filteredProjects = projects.filter(
    (project) => project.title === "Connectix2" || project.title === "better-tab"
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
      className="w-full"
    >
      <Card className="bg-transparent border-transparent w-full">
        <CardContent className="p-4 sm:p-6 w-full">
          <div className="flex flex-col gap-4 sm:gap-6 w-full">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.closest('a')) {
                    return
                  }
                  onProjectClick(project)
                }}
                className="w-full min-w-0 bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 sm:p-5 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-base sm:text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      <h4>{project.title}</h4>
                    </a>
                  ) : (
                    <h4 className="text-base sm:text-lg font-bold text-white">{project.title}</h4>
                  )}
                  <div className="flex gap-2">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        aria-label={`Visit ${project.title}`}
                      >
                        <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                        aria-label={`View ${project.title} on GitHub`}
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 text-sm sm:text-base mb-3">
                  {project.description}
                </p>
                {project.imageUrl && (
                  <div className="mb-2 rounded-lg overflow-hidden bg-gray-900 dark:bg-gray-100">
                    <Image
                      src={project.imageUrl}
                      alt={project.imageAlt}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
