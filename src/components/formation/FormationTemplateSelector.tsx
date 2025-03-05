
import React from "react";
import { FormationFormat } from "./types";
import { getFormationTemplatesForFormat } from "./utils/formationFormatUtils";

interface FormationTemplateSelectorProps {
  format: FormationFormat;
  onTemplateChange: (template: string) => void;
  selectedTemplate: string;
}

export const FormationTemplateSelector: React.FC<FormationTemplateSelectorProps> = ({
  format,
  onTemplateChange,
  selectedTemplate
}) => {
  const templates = getFormationTemplatesForFormat(format);
  
  console.log(`Rendering FormationTemplateSelector for format: ${format} with templates:`, templates);
  console.log(`Selected template: ${selectedTemplate}`);
  
  if (!templates || Object.keys(templates).length === 0) {
    console.warn(`No templates found for format: ${format}`);
    return null;
  }

  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
      {Object.keys(templates).map(template => (
        <button
          key={template}
          onClick={() => onTemplateChange(template)}
          className={`py-2 px-4 rounded-md border whitespace-nowrap ${
            selectedTemplate === template 
              ? 'bg-green-600 text-white border-green-700'
              : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
          }`}
        >
          {template}
        </button>
      ))}
    </div>
  );
};
