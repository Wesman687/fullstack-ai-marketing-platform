'use client'
import React, { lazy, useEffect } from 'react'
import ProjectDetailStepper from './ProjectDetailStepper';
import ProjectDetailBody from './ProjectDetailBody';
import ProjectDetailHeader from './ProjectDetailHeader';
import { Project } from '@/server/db/schema/schema';
import ConfirmationModal from '../ConfirmationModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const ManageUploadStep = lazy(() => import('../upload-step/ManageUploadStep'))
const ConfigurePromptsStep = lazy(() => import('../ConfigurePromptsStep'))
const GenerateContextStep = lazy(() => import('../GenerateContextStep'))

const steps = [
  { name: "Upload Media", tab: "upload", component: ManageUploadStep },
  { name: "Prompts", tab: "prompts", component: ConfigurePromptsStep },
  { name: "Generate", tab: "generate", component: GenerateContextStep },
]

interface ProjectPageProps {
  project: Project
}



export default function ProjectDetailView({ project }: ProjectPageProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isShowDeleteConfirmation, setIsShowDeleteConfirmation] = React.useState(false)
  const [title, setTitle] = React.useState(project.title)
  const searchParams = useSearchParams()

  const router = useRouter()
  useEffect(() => { 
    const tab = searchParams.get('tab') ?? "upload"
    setCurrentStep(findStepIndex(tab))
  },[searchParams])

  const findStepIndex = (tab: string) => {
    const index = steps.findIndex(step => step.tab === tab)
    return index === -1 ? 0 : index
  }

  const [currentStep, setCurrentStep] = React.useState(findStepIndex(searchParams.get('tab') ?? "upload"))

  const handleStepClick = (index: number) => {
    router.push(`/project/${project.id}?tab=${steps[index].tab}`, {
      scroll: false,
    });
  };
  
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await axios.delete(`/api/projects/${project.id}`)
      toast.success('Project deleted successfully.')
      router.push('/projects?deleted=true')

    } catch (error) {
      console.error("Failed to delete project", error)
      toast.error('Failed to delete project. Please try again.')
    } finally {
      setIsDeleting(false)
      setIsShowDeleteConfirmation(false)
    }
  }


  return (
    <div className='max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-12'>
      <ProjectDetailHeader project={project} setIsShowDeleteConfirmation={setIsShowDeleteConfirmation} title={title} setTitle={setTitle} />
      <ProjectDetailStepper steps={steps} currentStep={currentStep} handleStepClick={handleStepClick}  />
      <div className='bg-gray-50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm mt-10 sm:mt-12 lg:mt-10'>
      <ProjectDetailBody steps={steps} currentStep={currentStep} projectId={project.id} />
      </div>


      {isShowDeleteConfirmation && <ConfirmationModal
        isOpen={isShowDeleteConfirmation}
        title='Delete Project'
        message='Are you sure you want to delete this project?  This action cannot be undone.'
        isLoading={isDeleting}
        onClose={() => setIsShowDeleteConfirmation(false)}
        onConfirm={handleDelete}
      />
      }
    </div>
  )
}
