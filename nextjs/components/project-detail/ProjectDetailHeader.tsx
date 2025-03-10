'use client'
import { Project } from '@/server/db/schema/schema'
import React, { Dispatch, SetStateAction } from 'react'
import { Button } from '../ui/button'
import { cn } from '@/lib/utils'
import { CheckIcon, SquarePen, Trash2, X } from 'lucide-react'
import { Input } from '../ui/input'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ProjectDetailHeaderProps {
  project: Project;
  setIsShowDeleteConfirmation: Dispatch<SetStateAction<boolean>>;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
}

function ProjectDetailHeader({ project, setIsShowDeleteConfirmation, title, setTitle }: ProjectDetailHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false)

  const handleTitleSubmit = async () => {
    try {
      const response = await axios.patch<Project>(`/api/projects/${project.id}`, {
        title,
      })
      console.log("🔄 API Response:", response.data); // ✅ Debugging: Check API response
      setTitle(response.data.title)
      toast.success("Project title updated.")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("projectTitleUpdated", { detail: response.data.title }));
      }
      setIsEditing(false)
      
    } catch (error) {
      const defaultMessage = "Failed to update project title, Please try again."
      console.error(error)
      setIsEditing(false)
      if (axios.isAxiosError(error)) {
        console.log("IS AXIOS ERROR", error.response?.data)
         const errorMessages = error.response?.data?.error?.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (detail: any) => detail.message
        ) ?? [defaultMessage];
          errorMessages.forEach((message: string) => toast.error(message))

      } else {
        console.error(error)
        toast.error("An error occurred. Please try again.")
      }
    } finally {      
      window.location.reload()
    }
}
  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 w-full">
        {/* INPUT EDITOR */}
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border-gray-100 bg-gray-50 text-2xl sm:text-3xl lg:text-xl font-bold text-gray-900 w-full focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {/* ACTION BUTTONS */}
        <div className='flex gap-2'>
        <Button
          onClick={handleTitleSubmit}
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
          >
          <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          onClick={() => {
            setIsEditing(false);
            setTitle(project.title);
          }}
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"
          >
          <X className="w-4 h-4 sm:w-5 sm:h-5" onClick={()=> setIsEditing(false)}  />
        </Button>
          </div>
      </div>
    );
  }


  return (

    <div className='flex items-center justify-between md:space-x-2 w-full'>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate py-1">
        {title}
      </h1>
      <div className='flex items-center space-x-2'>
        <Button
          className={cn(
            "rounded-full p-0 bg-gray-100 text-gray-500 flex items-center justify-center",
            "h-8 w-8 sm:h-10 sm:w-10",
            "hover:text-main hover:bg-main/20"
          )}
          onClick={() => setIsEditing(true)}
        ><SquarePen className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Button
          className={cn(
            "rounded-full p-0 bg-gray-100 text-gray-500 flex items-center justify-center",
            "h-8 w-8 sm:h-10 sm:w-10",
            "hover:text-red-600 hover:bg-red-50"
          )}
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" onClick={()=>setIsShowDeleteConfirmation(true)} />
        </Button>

      </div>
    </div>
  )
}

export default ProjectDetailHeader