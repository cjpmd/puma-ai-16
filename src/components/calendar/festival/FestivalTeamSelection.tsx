import { TeamSelectionManager } from "@/components/TeamSelectionManager";

interface FestivalTeamSelectionProps {
  teams: Array<{ id: string; name: string; category: string }>;
  format: string;
  onTeamSelectionsChange: (selections: Record<string, Record<string, string>>) => void;
}

export const FestivalTeamSelection = ({ 
  teams, 
  format, 
  onTeamSelectionsChange 
}: FestivalTeamSelectionProps) => {
  return (
    <TeamSelectionManager
      teams={teams}
      format={format}
      onTeamSelectionsChange={onTeamSelectionsChange}
    />
  );
};