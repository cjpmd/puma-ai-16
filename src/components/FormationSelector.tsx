import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define position types and their options
const positionOptions = {
  GK: ["G (D)", "SK (A)", "SK (D)", "SK (S)"],
  DRL: ["CWB (A)", "CWB (S)", "FB (A)", "FB (D)", "FB (S)", "IFB (D)", "IWB (A)", "IWB (S)", "NFB (D)", "WB (A)", "WB (D)", "WB (S)"],
  DC: ["BPD (C)", "BPD (D)", "BPD (S)", "CD (C)", "CD (D)", "CD (S)", "L (D)", "L (S)", "NCB (C)", "NCB (D)", "NCB (S)", "WCB (A)", "WCB (D)", "WCB (S)"],
  WBRL: ["CWB (A)", "CWB (S)", "IWB (A)", "IWB (D)", "IWB (S)", "WB (A)", "WB (D)", "WB (S)"],
  DM: ["A (D)", "BWM (D)", "BWM (S)", "DLP (D)", "DLP (S)", "DM (D)", "DM (S)", "HB (D)", "RGA (S)", "RPM (S)", "VOL (A)", "VOL (S)"],
  MRL: ["DW (D)", "DW (S)", "IW (A)", "IW (S)", "W (A)", "W (S)", "WM (A)", "WM (D)", "WM (S)", "WP (A)", "WP (S)"],
  MC: ["AP (A)", "AP (S)", "BBM (S)", "BWM (D)", "BWM (S)", "CAR (S)", "CM (A)", "CM (D)", "CM (S)", "DLP (D)", "DLP (S)", "MEZ (A)", "MEZ (S)", "RPM (S)"],
  AMRL: ["AP (A)", "AP (S)", "IF (A)", "IF (S)", "IW (A)", "IW (S)", "RMD (A)", "T (A)", "W (A)", "W (S)", "WTF (A)", "WTF (S)"],
  AMC: ["AM (A)", "AM (S)", "AP (A)", "AP (S)", "EG (S)", "SS (A)", "T (A)"],
  ST: ["AF (A)", "CF (A)", "CF (S)", "DLF (A)", "DLF (S)", "FN (S)", "P (A)", "PF (A)", "PF (D)", "PF (S)", "T (A)", "TF (A)", "TF (S)"]
} as const;

type PositionType = keyof typeof positionOptions;

const formatPositions = {
  "4-a-side": ["gk", "dl", "dr", "st"],
  "5-a-side": ["gk", "dl", "dc", "dr", "st"],
  "7-a-side": ["gk", "dl", "dc", "dr", "ml", "mr", "st"],
  "9-a-side": ["gk", "dl", "dcl", "dcr", "dr", "ml", "mc", "mr", "st"],
  "11-a-side": ["gk", "dl", "dcl", "dc", "dcr", "dr", "ml", "mc", "mr", "amc", "st"]
} as const;

export const FormationSelector = () => {
  const [selectedPositions, setSelectedPositions] = useState<Record<string, string>>({});
  const [teamFormat, setTeamFormat] = useState<keyof typeof formatPositions>("7-a-side");

  // Fetch team format from settings
  const { data: teamSettings } = useQuery({
    queryKey: ["team-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_settings")
        .select("format")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (teamSettings?.format) {
      setTeamFormat(teamSettings.format as keyof typeof formatPositions);
    }
  }, [teamSettings]);

  const { data: positionDefinitions } = useQuery({
    queryKey: ["position-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_definitions")
        .select("abbreviation, full_name")
        .order("abbreviation");

      if (error) throw error;
      return data;
    },
  });

  const handlePositionChange = (position: string, value: string) => {
    setSelectedPositions(prev => ({
      ...prev,
      [position]: value
    }));
  };

  const PositionSelect = ({ position, label }: { position: string; label: PositionType }) => (
    <div className="w-64">
      <Select
        value={selectedPositions[position]}
        onValueChange={(value) => handlePositionChange(position, value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {positionOptions[label].map((option) => {
            const [abbrev, role] = option.split(" ");
            const positionDef = positionDefinitions?.find(
              def => def.abbreviation === abbrev
            );
            const displayText = positionDef 
              ? `${positionDef.full_name} [${abbrev}] ${role}`
              : option;
            
            return (
              <SelectItem key={option} value={option}>
                {displayText}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );

  const currentPositions = formatPositions[teamFormat];
  const maxSubstitutes = Math.ceil(currentPositions.length / 2);

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center space-y-8">
        {/* Dynamic position layout based on format */}
        {currentPositions.map((position, index) => (
          <div key={index} className="flex justify-center space-x-4">
            <PositionSelect 
              position={position} 
              label={
                position.includes('gk') ? 'GK' :
                position.includes('dc') ? 'DC' :
                position.includes('d') ? 'DRL' :
                position.includes('mc') ? 'MC' :
                position.includes('m') ? 'MRL' :
                position.includes('amc') ? 'AMC' :
                'ST'
              } 
            />
          </div>
        ))}

        {/* Substitutes */}
        <div className="flex justify-center space-x-4">
          {Array.from({ length: maxSubstitutes }, (_, i) => (
            <PositionSelect key={`sub${i}`} position={`sub${i + 1}`} label="ST" />
          ))}
        </div>

        {/* Position Counter */}
        <div className="text-sm text-gray-600 mt-4">
          Positions Selected: {Object.keys(selectedPositions).length}/{currentPositions.length + maxSubstitutes}
        </div>
      </div>
    </Card>
  );
};

export default FormationSelector;