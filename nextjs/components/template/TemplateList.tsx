"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Dot } from "lucide-react";
import { Template } from "@/server/db/schema/schema";
import { TemplatePrompt } from "@/server/db/schema/schema";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { getTimeDifference } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface TemplateListProps {
  templates: Template[];
}

function TemplateList({ templates, }: TemplateListProps) {
  const [templateStatuses, setTemplateStatuses] = useState<
    Record<string, number>
  >({});
  const [fetchedTemplates, setFetchedTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromptCount = async (templateId: string): Promise<number> => {
      try {
        const response = await axios.get<TemplatePrompt[]>(
          `/api/template/${templateId}/prompts`
        );
        console.log("template count response", response.data);
        return response.data.length;
      } catch (error) {
        console.error("Error fetching prompt count:", error);
        return 0;
      }
    };

    const fetchTemplateStatus = async () => {
      if (templates.length === 0) return;
      setIsLoading(true);
      setFetchedTemplates(templates);
      const promptCountsForTemplates: Record<string, number> = {};

      for (const template of templates) {
        // Fetch the status of each template
        const promptCounts = await fetchPromptCount(template.id);
        promptCountsForTemplates[template.id] = promptCounts;
      }

      setTemplateStatuses(promptCountsForTemplates);
      setIsLoading(false);
    };

    fetchTemplateStatus();
  }, [templates]);
  return (
    <div className="grid gap-7 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {fetchedTemplates.length > 0 &&templates?.map((template) => (
        <Link href={`/template/${template.id}`} key={template.id}>
          <Card className="border border-gray-200 p-1 rounded-xl hover:border-main hover:scale-[1.01] hover:shadow-md hover:text-main transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1 w-full">
                <CardTitle className="text-xl lg:text-2xl truncate pr-4">
                  {template.title}
                </CardTitle>
                {isLoading ? (
                  <Skeleton className="h-6 w-[40%]" />
                ) : (
                  <div className="flex items-center truncate">
                    <p className="text-sm text-gray-500 truncate">
                      {templateStatuses[template.id] || 0} prompts
                    </p>
                    <Dot className="text-main flex-shrink-0" />
                    <p className="text-sm text-gray-500 truncate">                      
                      Updated {getTimeDifference(template.updatedAt.toString())}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default TemplateList;
