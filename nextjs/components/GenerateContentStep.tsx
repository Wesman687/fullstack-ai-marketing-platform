"use client";

import React, {  useEffect, useState } from "react";
import GenerateStepHeader from "./GenerateStepHeader";
import axios from "axios";
import { Asset, GeneratedContent, Prompt } from "@/server/db/schema/schema";
import { MAX_TOKENS_ASSETS, MAX_TOKENS_PROMPT } from "@/lib/constants";
import toast from "react-hot-toast";
import GenerateStepBody from "./GenerateStepBody";

interface GenerateContentStepProps {
  projectId: string;
}

function GenerateContentStep({ projectId }: GenerateContentStepProps) {
  const [canGenerate, setCanGenerate] = useState(false);
  const [projectHasContent, setProjectHasContent] = useState(false);
  const [projectHasPrompts, setProjectHasPrompts] = useState(false);
  const [isAssetsTokenExceeded, setIsAssetsTokenExceeded] = useState(false);
  const [isPromptsTokenExceeded, setIsPromptsTokenExceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const canGenerate =
      projectHasContent &&
      projectHasPrompts &&
      !isAssetsTokenExceeded &&
      !isPromptsTokenExceeded &&
      !isLoading &&
      !isGenerating;

    setCanGenerate(canGenerate);
  }, [
    isAssetsTokenExceeded,
    isGenerating,
    isLoading,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);
  console.log(projectId)
  console.log(projectHasContent, projectHasPrompts, isAssetsTokenExceeded, isPromptsTokenExceeded, isLoading, isGenerating)
  useEffect(() => {
    const fetchAllProjectData = async () => {
      setIsLoading(true);

      try {
        const [generatedContentResponse, assetsResponse, promptsResponse] =
          await Promise.all([
            axios.get<GeneratedContent[]>(
              `/api/projects/${projectId}/generated-content`
            ),
            axios.get<Asset[]>(`/api/projects/${projectId}/assets`),
            axios.get<Prompt[]>(`/api/projects/${projectId}/prompts`),
          ]);
          
        console.log(generatedContentResponse.data, "Generated Content")
        console.log(assetsResponse.data, " Assets")
        console.log(promptsResponse.data, " Prompts")
        setGeneratedContent(generatedContentResponse.data);
        setGeneratedCount(generatedContentResponse.data.length);
        setProjectHasContent(
          assetsResponse.data.some(
            (asset) => asset.content && asset.content.trim().length > 0
          )
        );

        setProjectHasPrompts(promptsResponse.data.length > 0);
        setTotalPrompts(promptsResponse.data.length);

        // Check to make sure we don't exceed asset token limits
        let totalTokenCount = 0;
        for (const asset of assetsResponse.data) {
          totalTokenCount += asset.tokenCount ?? 0;
        }
        setIsAssetsTokenExceeded(totalTokenCount > MAX_TOKENS_ASSETS);

        // Check to make sure we don't exceed prompt token limits
        for (const prompt of promptsResponse.data) {
          if (prompt?.tokenCount ?? 0 > MAX_TOKENS_PROMPT) {
            setIsPromptsTokenExceeded(true);
            break;
          }
        }
      } catch (error) {
        toast.error("Failed to fetch project data");
        setProjectHasContent(false);
        setProjectHasPrompts(false);
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProjectData();
  }, [projectId]);

  useEffect(() => {
    let newErrorMessage = null;

    if (!projectHasContent || !projectHasPrompts) {
      const missingItems = [];
      if (!projectHasContent) missingItems.push("valid assets");
      if (!projectHasPrompts) missingItems.push("add prompts");

      newErrorMessage = `Please add ${missingItems.join(
        " and "
      )} before generating content.`;
    } else if (isAssetsTokenExceeded || isPromptsTokenExceeded) {
      const exceededItems = [];
      if (isAssetsTokenExceeded) exceededItems.push("assets");
      if (isPromptsTokenExceeded) exceededItems.push("prompts");

      newErrorMessage = `Your ${exceededItems.join(
        " and "
      )} exceed the maximum token limit. Please reduce the size of your ${exceededItems.join(
        " or "
      )}.`;
    }

    setErrorMessage(newErrorMessage);
  }, [
    isAssetsTokenExceeded,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);

  const startGeneration = async () => {
    setGeneratedContent([]);
    setGeneratedCount(0);
    setIsGenerating(true);
    try {
      axios.delete(`/api/projects/${projectId}/generated-content`);
      setIsGenerating(true);

      await axios.post<GeneratedContent[]>(
        `/api/projects/${projectId}/generated-content`
      );
    } catch (error) {
      console.error("Failed to generate content", error);
      toast.error("Failed to generate content");      
      setIsGenerating(false);
    }
  }
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;
    const fetchGeneratedContent = async () => {
      try {
        const response = await axios.get<GeneratedContent[]>(
          `/api/projects/${projectId}/generated-content`
        );
        setGeneratedContent(response.data);
        setGeneratedCount(response.data.length);

        if (response.data.length === totalPrompts) {
          clearInterval(pollingInterval);
          setIsGenerating(false);
          toast.success("Content generation complete");
        }
      }
      catch (error) {
        console.error("Failed to fetch generated content", error);
        toast.error("Failed to fetch generated content");
      }
    };
    if (isGenerating) {
      pollingInterval = setInterval(async () => {
        fetchGeneratedContent();
      }, 1000);
    }
    return () => {
      if (pollingInterval){
        clearInterval(pollingInterval);
      }
    }
  }, [isGenerating, projectId, totalPrompts]);
  return (
    <div>
      <GenerateStepHeader canGenerateContent={canGenerate} startGeneration={startGeneration } />
      <GenerateStepBody
        isLoading={isLoading}
        isGenerating={isGenerating}
        generatedCount={generatedCount}
        totalPrompts={totalPrompts}
        errorMessage={errorMessage}
        generatedContent={generatedContent}
        projectId={projectId}
        setGeneratedContent={setGeneratedContent}
      />
    </div>
  );
}

export default GenerateContentStep;
