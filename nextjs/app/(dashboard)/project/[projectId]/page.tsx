
import ProjectDetailView from '@/components/project-detail/ProjectDetailView';
import { notFound } from 'next/navigation'
import React from 'react'

interface ProjectPageProps {
  params: {
    projectId: string;
  }
}


export default function ProjectPage({ params }: ProjectPageProps) {

  return (
    <ProjectDetailView />
  )
}
