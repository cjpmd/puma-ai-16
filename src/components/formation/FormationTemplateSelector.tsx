
import React from "react";
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
  
  console.log(`Rendering FormationTemplateSelector for format: ${format} with templates:`, templates);
  console.log(`Selected template: ${selectedTemplate}`);
  
  if (!templates || Object.keys(templates).length === 0) {
    console.warn(`No templates found for format: ${format}`);
    return null;
  }

  const renderMiniPitch = (templateName: string, isSelected: boolean) => {
    return (
      <div 
        className={`relative cursor-pointer w-[70px] h-[90px] rounded-md border ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={() => onTemplateChange(templateName)}
      >
        {/* Field markings */}
        <div className="absolute inset-0 bg-green-600 rounded-md overflow-hidden">
          {/* Center line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 -translate-y-1/2"></div>
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full border border-white/60 -translate-x-1/2 -translate-y-1/2"></div>
          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 w-5 h-2 border-b-[1px] border-l-[1px] border-r-[1px] border-white/60 -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-5 h-2 border-t-[1px] border-l-[1px] border-r-[1px] border-white/60 -translate-x-1/2"></div>
        </div>
        
        {/* Formation name */}
        <div className="absolute bottom-1 left-0 right-0 text-center text-xs font-medium text-black">
          {templateName}
        </div>
        
        {/* Player positions - would place dots representing players */}
        {renderFormationDots(format, templateName)}
      </div>
    );
  };

  const renderFormationDots = (format: FormationFormat, templateName: string) => {
    let positions: Array<{x: number, y: number}> = [];
    
    // Define positions based on formation
    if (format === "7-a-side") {
      if (templateName === "1-1-3-1") {
        // GK, DC, DM, AML, AMC, AMR, STC
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 50, y: 70 }, // DC
          { x: 50, y: 55 }, // DM
          { x: 30, y: 40 }, // AML
          { x: 50, y: 40 }, // AMC
          { x: 70, y: 40 }, // AMR
          { x: 50, y: 20 }, // STC
        ];
      } else if (templateName === "2-3-1") {
        // GK, DL, DR, ML, MC, MR, STC
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 30, y: 70 }, // DL
          { x: 70, y: 70 }, // DR
          { x: 30, y: 45 }, // ML
          { x: 50, y: 45 }, // MC
          { x: 70, y: 45 }, // MR
          { x: 50, y: 20 }, // STC
        ];
      } else if (templateName === "3-2-1") {
        // GK, DL, DC, DR, MCL, MCR, STC
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 30, y: 70 }, // DL
          { x: 50, y: 70 }, // DC
          { x: 70, y: 70 }, // DR
          { x: 35, y: 45 }, // MCL
          { x: 65, y: 45 }, // MCR
          { x: 50, y: 20 }, // STC
        ];
      } else if (templateName === "All") {
        // Just a generic formation for "All"
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 30, y: 70 }, // DL
          { x: 50, y: 70 }, // DC
          { x: 70, y: 70 }, // DR
          { x: 20, y: 45 }, // ML
          { x: 50, y: 45 }, // MC
          { x: 80, y: 45 }, // MR
          { x: 30, y: 20 }, // STL
          { x: 70, y: 20 }, // STR
        ];
      }
    } else if (format === "9-a-side") {
      if (templateName === "3-2-3") {
        // GK, DL, DC, DR, MCL, MCR, AMC, STL, STR
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 30, y: 70 }, // DL
          { x: 50, y: 70 }, // DC
          { x: 70, y: 70 }, // DR
          { x: 35, y: 50 }, // MCL
          { x: 65, y: 50 }, // MCR
          { x: 50, y: 35 }, // AMC
          { x: 35, y: 20 }, // STL
          { x: 65, y: 20 }, // STR
        ];
      } else if (templateName === "2-4-2") {
        // GK, DCL, DCR, DM, ML, MR, AMC, STC
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 35, y: 70 }, // DCL
          { x: 65, y: 70 }, // DCR
          { x: 50, y: 60 }, // DM
          { x: 25, y: 50 }, // ML
          { x: 75, y: 50 }, // MR
          { x: 50, y: 40 }, // AMC
          { x: 50, y: 20 }, // STC
        ];
      } else if (templateName === "3-3-2") {
        // GK, DL, DC, DR, ML, MC, MR, STL, STR
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 30, y: 70 }, // DL
          { x: 50, y: 70 }, // DC
          { x: 70, y: 70 }, // DR
          { x: 30, y: 50 }, // ML
          { x: 50, y: 50 }, // MC
          { x: 70, y: 50 }, // MR
          { x: 35, y: 20 }, // STL
          { x: 65, y: 20 }, // STR
        ];
      } else if (templateName === "All") {
        // Just a generic formation for "All"
        positions = [
          { x: 50, y: 85 }, // GK
          { x: 20, y: 70 }, // DL
          { x: 50, y: 70 }, // DC
          { x: 80, y: 70 }, // DR
          { x: 20, y: 50 }, // ML
          { x: 50, y: 50 }, // MC
          { x: 80, y: 50 }, // MR
          { x: 35, y: 20 }, // STL
          { x: 65, y: 20 }, // STR
        ];
      }
    }
    
    return positions.map((pos, index) => (
      <div 
        key={index}
        className="absolute w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      />
    ));
  };

  return (
    <div className="mb-4 border p-3 rounded-md bg-white shadow-sm">
      <div className="text-sm font-medium mb-2">Formation:</div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-3 overflow-x-auto pb-2 w-full">
          {Object.keys(templates).map((templateName) => (
            <div key={templateName} className="flex-shrink-0">
              {renderMiniPitch(templateName, selectedTemplate === templateName)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
