
import React from "react";
import { FormationFormat } from "./types";
import { getFormationTemplatesByFormat } from "./utils/formationTemplates";
import { cn } from "@/lib/utils";

interface FormationTemplateSelectorProps {
  format: FormationFormat;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

export const FormationTemplateSelector: React.FC<FormationTemplateSelectorProps> = ({
  format,
  selectedTemplate,
  onTemplateChange
}) => {
  const templates = getFormationTemplatesByFormat(format);

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">Formation Template</h4>
      <div className="grid grid-cols-4 gap-2">
        {templates.map((template) => (
          <button
            key={template.name}
            onClick={() => onTemplateChange(template.name)}
            className={cn(
              "p-2 h-16 flex flex-col items-center justify-center rounded-md text-xs transition-colors",
              selectedTemplate === template.name
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <div className="relative w-8 h-10 bg-green-600/60 rounded-sm mb-1 flex items-center justify-center">
              {/* Mini pitch visualization */}
              <span className="text-[6px] text-white">{template.name}</span>
            </div>
            <span>{template.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
