'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Project } from '@/server/db/schema/schema';
import { cn, getTimeDifference } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { FileIcon, Sparkles, Text } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
}

type ProjectStatus = {
  fileCount: number;
  promptCount: number;
  hasGeneratedContent: boolean;
}

function ProjectList({ projects }: ProjectListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [projectStatuses, setProjectStatuses] = useState<Record<string, ProjectStatus>>({})

  useEffect(() => {
    setIsLoading(true)
    const fetchProjectStatuses = async () => {
      const statuses: Record<string, ProjectStatus> = {}

      const fetchStatus = async (projectId: string) => {
        const [fileCount, promptCount, hasGeneratedContent] = await Promise.all([
          fetchFileCount(projectId),
          fetchPromptCount(projectId),
          checkGeneratedContentStatus(projectId)
        ])
        statuses[projectId] = {
          fileCount,
          promptCount,
          hasGeneratedContent
        }
      }
      await Promise.all(projects.map(project => fetchStatus(project.id)))
      setProjectStatuses(statuses)
      setIsLoading(false)
    }
    fetchProjectStatuses()
  }, [projects])

  const fetchFileCount = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/assets`)
      const data = await response.json()
      return data.length
    } catch (error) {
      console.error('Error fetching file count:', error)
      return 0
    }
  }
  const fetchPromptCount = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/prompts`)
      const data = await response.json()
      return data.length
    } catch (error) {
      console.error('Error fetching prompt count:', error)
      return 0
    }
  }
  const checkGeneratedContentStatus = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/generated-content`)
      const data = await response.json()
      return data.length
    } catch (error) {
      console.error('Error fetching generated content status:', error)
      return false
    }
  }
  return (
    <div className="grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* TODO: iterate through each project and convert it into its own card */}
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          <Card className="border border-gray-200 rounded-3xl p-3 hover:border-main hover:scale-[1.01] hover:shadow-md hover:text-main transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-5 w-full">

              <CardTitle className="text-lg sm:text-xl lg:text-2xl truncate">
                {project.title}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Updated {getTimeDifference(project.updatedAt.toString())}
              </p>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4 lg:space-y-5'>
              <div className='space-y-2 sm:space-y-3 pl-2'>
                <ProjectStatus projectStatus={projectStatuses[project.id]} isLoading={isLoading} />

              </div>

            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default ProjectList

function ProjectStatus({  isLoading, projectStatus }: { projectStatus: ProjectStatus, isLoading: boolean }) {
  if (isLoading) {
    return (
    <>
      <Skeleton className='h-4 sm:h-5 lg:h-6 w-[40%]' />
      <Skeleton className='h-4 sm:h-5 lg:h-6 w-[70%]' />
      <Skeleton className='h-4 sm:h-5 lg:h-6 w-[55%]' />
    </>
    )
  }
  return (
    <>
      <div
        className={cn(
          "flex items-center font-medium truncate",
          (!projectStatus || projectStatus.fileCount === 0) && "text-gray-400"
        )}
      >
        <FileIcon
          className={cn(
            "flex-shrink-0 w-5 h-5 mr-2",
            projectStatus?.fileCount > 0 && "text-main"
          )}
        />
        <span className="truncate">{projectStatus?.fileCount || 0} files</span>
      </div>
      <div
        className={cn(
          "flex items-center font-medium truncate",
          (!projectStatus || projectStatus.promptCount === 0) && "text-gray-400"
        )}
      >
        <Text
          className={cn(
            "flex-shrink-0 w-5 h-5 mr-2",
            projectStatus?.promptCount > 0 && "text-main"
          )}
          strokeWidth={2.5}
        />
        <span className="truncate">
          {projectStatus?.promptCount || 0} prompts
        </span>
      </div>
      <div
        className={cn(
          "flex items-center font-medium truncate",
          (!projectStatus || !projectStatus.hasGeneratedContent) &&
            "text-gray-400"
        )}
      >
        <Sparkles
          className={cn(
            "flex-shrink-0 w-5 h-5 mr-2",
            projectStatus?.hasGeneratedContent && "text-main"
          )}
        />
        <span className="truncate">Final Posts</span>
      </div>
    </>
  );
}