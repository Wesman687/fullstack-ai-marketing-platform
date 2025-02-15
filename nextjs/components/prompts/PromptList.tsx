
import React from 'react'
import PromptContainerCard from './PromptContainerCard';
import { Skeleton } from '../ui/skeleton';
import { useRouter } from 'next/navigation';
import { CommonPrompt } from '@/app/interfaces/CommonPrompts';
interface PromptListProps {
  prompts: CommonPrompt[];
  isLoading: boolean;
  setDeletePromptId: (promptId: string) => void;
  
}

function PromptList({ prompts, isLoading, setDeletePromptId }: PromptListProps) {
  const router = useRouter();

  function handleOnClick(promptId: string) {
    // TODO: Future us, update to support template list as well
    router.push(`?tab=prompts&promptId=${promptId}`);
  }

  if (isLoading) {
    return <>
      <Skeleton className='h-12 md:h-20 w-full rounded-xl mb-4' />
      <Skeleton className='h-12 md:h-20 w-full rounded-xl mb-4' />
      <Skeleton className='h-12 md:h-20 w-full rounded-xl' />
    </>
  }
  if (prompts.length === 0) {
    return <div className='text-center text-gray-500'>No prompts found</div>
  }
  return (
    <div className='space-y-6'>
      {prompts.map((prompt, index) => (
        <PromptContainerCard
          key={index}
          prompt={prompt}
          handleOnDelete={()=>setDeletePromptId(prompt.id)}
          handleOnClick={handleOnClick}
        />
      ))}
    </div>
  )
}

export default PromptList