
import React from 'react'
import ProjectDetailStepper from './ProjectDetailStepper';
import ProjectDetailBody from './ProjectDetailBody';
import ProjectDetailHeader from './ProjectDetailHeader';
import { Project } from '@/server/db/schema';

interface ProjectPageProps {
  project: Project
}


export default function ProjectDetailView({  project }: ProjectPageProps) {

  return (
    <div>
      <ProjectDetailHeader />
      <ProjectDetailStepper />
      <ProjectDetailBody />
    </div>
  )
}
