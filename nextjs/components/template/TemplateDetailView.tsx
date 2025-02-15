'use client'
import { Template } from '@/server/db/schema/schema'
import React, { useEffect, useState } from 'react'
import TemplateDetailHeader from './TemplateDetailHeader';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import ConfirmationModal from '../ConfirmationModal';
import TemplateDetailBody from './TemplateDetailBody';
import PromptEditorDialog from './PromptEditorDialog';
import { CommonPrompt } from '@/app/interfaces/CommonPrompts';

interface TemplateDetailViewProps {
    template: Template
}

function TemplateDetailView({template}: TemplateDetailViewProps) {
    const [showTemplateDeleteConfirmation, setShowTemplateDeleteConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [prompts, setPrompts] = useState<CommonPrompt[]>([]);
    const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
    const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<CommonPrompt | null>(null);
    const [isSavingPrompt, setIsSavingPrompt] = useState(false);
    const [isDeletingPrompt, setIsDeletingPrompt] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const handleCreatePrompt = async () => {
        setIsCreatingPrompt(true);
        try {
            const response = await axios.post(`/api/template/${template.id}/prompts`, {
                name: "New Prompt",
                prompt: "",
                order: prompts.length,
                tokenCount: 0,
            });
            if (response.status === 200) {
                toast.success("Prompt created successfully");
                const newPrompt = response.data;
                setPrompts([...prompts, newPrompt]);
                router.push(`?promptId=${newPrompt.id}`);
            }
        } catch (error) {
            toast.error("Error creating prompt");
            console.error(error);
        } finally {
            setIsCreatingPrompt(false);
        }
    }

    const handleOnSave = async (updatedPrompt: CommonPrompt) => {
        setIsSavingPrompt(true);
        try {
          const response = await axios.patch<CommonPrompt>(
            `/api/template/${template.id}/prompts`,
            updatedPrompt
          );
          const savedPrompt = response.data;
    
          setPrompts(
            prompts.map((p) => (p.id === updatedPrompt.id ? savedPrompt : p))
          );
          toast.success("Prompt saved successfully");
          handleCloseDialog();
        } catch (error) {
          console.error("Failed to save prompt:", error);
          toast.error("Failed to save prompt. Please try again.");
        } finally {
          setIsSavingPrompt(false);
        }
      };
    
      const handleCloseDialog = () => {
        setSelectedPrompt(null);
        router.push(`/template/${template.id}`, { scroll: false });
      };

    const handleDeleteTemplate = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(`/api/template/${template.id}`);
            if (response.status === 200) {
                toast.success("Template deleted successfully");
                router.push("/templatez?deleted=true");
            }
        } catch (error) {
            toast.error("Error deleting template");
            console.error(error);
        } finally {
            setIsDeleting(false);
            setShowTemplateDeleteConfirmation(false);
        }
        
    }
    const handleDeletePrompt = async (id: string) => {
        setIsDeletingPrompt(true);
        try {
          await axios.delete(`/api/template/${template.id}/prompts?id=${id}`);
          setPrompts(prompts.filter((p) => p.id !== id));
          toast.success("Prompt deleted successfully");
        } catch (error) {
          console.error("Failed to delete prompt:", error);
          toast.error("Failed to delete prompt. Please try again.");
        } finally {
          setDeletePromptId(null);
          setIsDeletingPrompt(false);
        }
      };
    
    useEffect(() => {
        setIsLoading(true);
        const fetchPrompts = async () => {
            const response = await axios.get(`/api/template/${template.id}/prompts`);
            setPrompts(response.data);
        }
        fetchPrompts();
        setIsLoading(false);
    }, [template.id]);
    useEffect(() => {
        const promptId = searchParams.get("promptId");
        if (promptId) {
          const prompt = prompts.find((p) => p.id === promptId);
          if (prompt) setSelectedPrompt(prompt);
        } else {
          setSelectedPrompt(null);
        }
      }, [searchParams, prompts]);

    return (
        <div className="space-y-4 md:space-x-6">

          <TemplateDetailHeader
            template={template}
            setShowTemplateDeleteConfirmation={setShowTemplateDeleteConfirmation}
          />
          <ConfirmationModal
            isOpen={showTemplateDeleteConfirmation}
            onClose={() => setShowTemplateDeleteConfirmation(false)}
            onConfirm={handleDeleteTemplate}
            title="Delete Template"
            message="Are you sure you want to delete this template? This action cannot be undone."
            isLoading={isDeleting}
          />
          <TemplateDetailBody
            handleCreatePrompt={handleCreatePrompt}
            isCreatingPrompt={isCreatingPrompt}
            isLoading={isLoading}
            prompts={prompts}
            setDeletePromptId={setDeletePromptId}
          /> 
          <ConfirmationModal
            title="Delete Prompt"
            message="Are you sure you want to delete this prompt? This action cannot be undone."
            isOpen={!!deletePromptId}
            isLoading={isDeletingPrompt}
            onClose={() => setDeletePromptId(null)}
            onConfirm={() => deletePromptId && handleDeletePrompt(deletePromptId)}
          /> 
           <PromptEditorDialog
            isOpen={!!selectedPrompt}
            prompt={selectedPrompt}
            handleOnClose={handleCloseDialog}
            isSaving={isSavingPrompt}
            handleSave={handleOnSave}
          /> 
        </div>
      );
    }
    

export default TemplateDetailView