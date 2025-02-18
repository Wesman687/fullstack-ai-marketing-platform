import TemplateDetailView from '@/components/template/TemplateDetailView';
import { getTemplate } from '@/server/db/queries'
import { notFound } from 'next/navigation';
import React, { use } from 'react'

interface TemplatePageProps {
  params: Promise<{ templateId: string }>
}

export default  function TemplatePage({ params }: TemplatePageProps) {
  const { templateId } = use(params); // ✅ No need to await
  const template = use(getTemplate(templateId));

  if (!template) {
    return notFound();
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 mt-2">
      <TemplateDetailView template={template} />
    </div>
  );
}
