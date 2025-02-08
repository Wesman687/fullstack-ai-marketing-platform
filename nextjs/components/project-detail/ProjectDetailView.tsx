
import React from 'react'
import ProjectDetailStepper from './ProjectDetailStepper';
import ProjectDetailBody from './ProjectDetailBody';
import ProjectDetailHeader from './ProjectDetailHeader';

// interface ProjectPageProps {
//   project: Project
// }


export default function ProjectDetailView() {

  return (
    <div>
      <ProjectDetailHeader />
      <ProjectDetailStepper />
      <ProjectDetailBody />
    </div>
  )
}
