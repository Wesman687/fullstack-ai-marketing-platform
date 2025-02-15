import TemplateDetailView from '@/components/template/TemplateDetailView';
import { getTemplate } from '@/server/db/queries'
import { notFound } from 'next/navigation';
import React from 'react'

export default async function TemplatePage({params}: {params: {templateId: string}}) {
  const {templateId} = await params;
  const template = await getTemplate(templateId)
  
  if (!template) {
    return notFound();
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 mt-2">
      <TemplateDetailView template={template} />
    </div>
  );
}