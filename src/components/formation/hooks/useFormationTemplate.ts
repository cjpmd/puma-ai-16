
import { useState, useEffect } from "react";
import { FormationFormat } from "../types";
import { getPositionsForTemplate } from "../utils/formationTemplates";

export function useFormationTemplate(format: FormationFormat) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("All");
  const [visiblePositions, setVisiblePositions] = useState<string[]>([]);

  useEffect(() => {
    const positions = getPositionsForTemplate(format, selectedTemplate);
    setVisiblePositions(positions);
  }, [format, selectedTemplate]);

  const handleTemplateChange = (template: string) => {
    console.log(`Selecting formation template: ${template}`);
    setSelectedTemplate(template);
  };

  return {
    selectedTemplate,
    visiblePositions,
    handleTemplateChange
  };
}
