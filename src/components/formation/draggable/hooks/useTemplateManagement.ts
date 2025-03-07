
import { useState, useEffect } from "react";

interface UseTemplateManagementProps {
  initialTemplate?: string;
  onTemplateChange?: (template: string) => void;
}

export const useTemplateManagement = ({
  initialTemplate = "All",
  onTemplateChange
}: UseTemplateManagementProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate);

  // Handle formation template changes
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (onTemplateChange) {
      onTemplateChange(template);
    }
  };

  // Sync template from props
  useEffect(() => {
    if (initialTemplate && initialTemplate !== selectedTemplate) {
      setSelectedTemplate(initialTemplate);
    }
  }, [initialTemplate, selectedTemplate]);

  return {
    selectedTemplate,
    handleTemplateChange
  };
};
