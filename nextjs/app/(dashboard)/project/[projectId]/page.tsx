"use client";

import React, { useEffect, useState, use } from "react";
import ProjectDetailView from "@/components/project-detail/ProjectDetailView";
import { getProject } from "@/server/actions"; // ✅ Fetches project safely from server
import ProjectLoading from "../loading";

interface Project {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface ProjectPageProps {
  params: Promise<{ projectId: string }>; // ✅ Ensure params is a Promise
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params); // ✅ Unwrap params using `use()`
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      try {
        const data: Project | null = await getProject(projectId); // ✅ Fetch using server action
        setProject(data);
      } catch (error) {
        console.error("❌ Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();

    // ✅ Listen for updates to the project title
    const handleTitleChange = (event: CustomEvent) => {
      setProject((prev) => prev ? { ...prev, title: event.detail } : prev);
    };

    window.addEventListener("projectTitleUpdated", handleTitleChange as EventListener);
    
    return () => {
      window.removeEventListener("projectTitleUpdated", handleTitleChange as EventListener);
    };

  }, [projectId]);

  if (loading) return <ProjectLoading />;
  if (!project) return <div>Project not found.</div>;

  return <ProjectDetailView project={project} />;
}
