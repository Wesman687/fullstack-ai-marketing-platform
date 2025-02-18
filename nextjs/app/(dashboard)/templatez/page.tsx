'use client'
import TemplateList from "@/components/template/TemplateList";
import { Button } from "@/components/ui/button";
import { Template } from "@/server/db/schema/schema";
import axios from "axios";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default  function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      const result = await axios.get("/api/templatez");
      setTemplates(result.data);
    };
    fetchTemplates();
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget);

    try {
      const response = await axios.post("/api/templatez", formData); 
      // Redirect after successful template creation
      router.push(`/template/${response.data.templateId}`); // Or however you access it
    } catch (error) {
      // Handle errors (display message, etc.)
      console.error("Error creating template:", error);
      alert("Failed to create template. Please try again.");
    } 
  };  

  return (
    <div className="w-full">
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 mt-2 space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div className="space-y-2 sm:space-y-4 mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              My Templates
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              View and manage your templates and prompts here
            </p>
          </div>
          <form onSubmit={handleFormSubmit} className="w-full sm:w-auto">
            <Button type="submit" className="rounded-3xl text-base w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" strokeWidth={3} />
              New Template
            </Button>
          </form>
        </div>
        <TemplateList templates={templates}  />
      </div>
    </div>
  );
}
