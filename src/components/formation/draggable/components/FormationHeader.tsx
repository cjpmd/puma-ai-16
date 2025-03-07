
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormationFormat } from "../../types";
import { FormationTemplateSelector } from "../../FormationTemplateSelector";
import { Grip, Users, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FormationHeaderProps {
  squadMode: boolean;
  onToggleSquadMode: () => void;
  squadPlayersLength: number;
  periodDisplayName: string;
  format: FormationFormat;
  template: string;
  onTemplateChange?: (template: string) => void;
  onDurationChange?: (duration: number) => void;
  localDuration?: number;
  periodId?: number;
  canExitSquadMode?: boolean;
}

export const FormationHeader: React.FC<FormationHeaderProps> = ({
  squadMode,
  onToggleSquadMode,
  squadPlayersLength,
  periodDisplayName,
  format,
  template,
  onTemplateChange,
  onDurationChange,
  localDuration,
  periodId,
  canExitSquadMode = true
}) => {
  // Debug output
  console.log("FormationHeader rendering with squad mode:", squadMode, "canExit:", canExitSquadMode, "players:", squadPlayersLength);
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  variant={squadMode ? "default" : "outline"}
                  onClick={onToggleSquadMode}
                  className="flex items-center"
                  disabled={squadMode && !canExitSquadMode}
                >
                  {squadMode ? (
                    <>
                      <Grip className="mr-2 h-4 w-4" />
                      Proceed to Position Assignment
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Return to Squad Selection
                    </>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            {squadMode && !canExitSquadMode && (
              <TooltipContent>
                <p>Add at least one player to the squad first</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        
        {!squadMode && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{periodDisplayName}</span>
            {onDurationChange && localDuration !== undefined && (
              <>
                <Label htmlFor="duration-input" className="ml-4">Duration (min):</Label>
                <Input
                  id="duration-input"
                  type="number"
                  min="1"
                  max="90"
                  className="w-[80px]"
                  value={localDuration}
                  onChange={(e) => onDurationChange(parseInt(e.target.value) || 45)}
                />
              </>
            )}
          </div>
        )}
      </div>
      
      {!squadMode && onTemplateChange && (
        <FormationTemplateSelector
          format={format}
          selectedTemplate={template}
          onTemplateChange={onTemplateChange}
        />
      )}
    </div>
  );
};
