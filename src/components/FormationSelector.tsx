import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useState } from "react";
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

export const FormationSelector = () => {
  const [selectedPositions, setSelectedPositions] = useState<Record<string, string>>({});

  // Fetch position definitions from the database
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
              ? `${positionDef.full_name} ${role}`
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

  return (
    <Card className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex flex-col items-center space-y-8">
        {/* Strikers */}
        <div className="flex justify-center space-x-4">
          <PositionSelect position="st1" label="ST" />
          <PositionSelect position="st2" label="ST" />
        </div>

        {/* Attacking Midfielders */}
        <div className="flex justify-center space-x-4">
          <PositionSelect position="aml" label="AMRL" />
          <PositionSelect position="amc" label="AMC" />
          <PositionSelect position="amr" label="AMRL" />
        </div>

        {/* Central Midfielders */}
        <div className="flex justify-center space-x-4">
          <PositionSelect position="ml" label="MRL" />
          <PositionSelect position="mcl" label="MC" />
          <PositionSelect position="mc" label="MC" />
          <PositionSelect position="mcr" label="MC" />
          <PositionSelect position="mr" label="MRL" />
        </div>

        {/* Defensive Midfielders */}
        <div className="flex justify-center space-x-4">
          <PositionSelect position="dml" label="DM" />
          <PositionSelect position="dm" label="DM" />
          <PositionSelect position="dmr" label="DM" />
        </div>

        {/* Defenders */}
        <div className="flex justify-center space-x-4">
          <PositionSelect position="wbl" label="WBRL" />
          <PositionSelect position="dl" label="DRL" />
          <PositionSelect position="dcl" label="DC" />
          <PositionSelect position="dc" label="DC" />
          <PositionSelect position="dcr" label="DC" />
          <PositionSelect position="dr" label="DRL" />
          <PositionSelect position="wbr" label="WBRL" />
        </div>

        {/* Goalkeeper */}
        <div className="flex justify-center">
          <PositionSelect position="gk" label="GK" />
        </div>

        {/* Position Counter */}
        <div className="text-sm text-gray-600 mt-4">
          Positions Selected: {Object.keys(selectedPositions).length}/23
        </div>
      </div>
    </Card>
  );
};

export default FormationSelector;