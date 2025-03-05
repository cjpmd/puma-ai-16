
import { useState } from 'react';
import { FormationFormat } from '../types';
import { getFormationTemplatesByFormat } from '../utils/formationTemplates';

export const useFormationTemplate = (format: FormationFormat) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("All");
  
  const templates = getFormationTemplatesByFormat(format);
  const hasTemplates = Object.keys(templates).length > 0;
  
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
  };
  
  return {
    selectedTemplate,
    handleTemplateChange,
    hasTemplates,
    templates
  };
};
