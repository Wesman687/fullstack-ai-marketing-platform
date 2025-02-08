'use client'
import ProjectList from '@/components/ProjectList';
import { Button } from '@/components/ui/button';
import { createProject } from '@/server/mutation'
import { Plus } from 'lucide-react'
import { fetchProjects } from "@/server/actions"; // ✅ Import server function
import React, { useEffect, useState } from 'react'

type Project = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export default function Projects() {

  const [projects, setProjects] = useState<Project[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // ✅ Fetch projects when the component mounts
  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
      }
    }
    loadProjects();
  }, []);
  return (
    <div className="w-full">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 mt-2 space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              My Projects
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Manage your Marketing projects effectively using AI
            </p>
          </div>
          <form action={createProject} className="w-full sm:w-auto">
            <Button className="rounded-3xl text-base w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" strokeWidth={3} />
              New Project
            </Button>
          </form>
        </div>
        <ProjectList projects={projects} />
      </div>
    </div>
  )
}
