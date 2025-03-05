
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
  
  if (!templates || Object.keys(templates).length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Formation:</div>
        <Select
          value={selectedTemplate}
          onValueChange={onTemplateChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Select formation" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(templates).map((template) => (
              <SelectItem key={template} value={template}>
                {template}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
