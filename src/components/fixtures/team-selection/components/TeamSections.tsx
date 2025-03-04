
import { Player } from "@/types/player";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamSelection } from "../context/TeamSelectionContext";
import { usePeriods } from "../hooks/usePeriods";

interface TeamSectionsProps {
  availablePlayers: Player[];
}

export const TeamSections = ({ availablePlayers }: TeamSectionsProps) => {
  const { activeTeamId } = useTeamSelection();
  const { periodsPerTeam } = usePeriods();
  
  // Get periods for the active team
  const activePeriods = periodsPerTeam[activeTeamId] || [];
  
  return (
    <div className="space-y-4">
      {activePeriods.length > 0 ? (
        activePeriods.map((period) => (
          <Card key={period.id}>
            <CardContent className="pt-4">
              <h3 className="text-lg font-medium mb-2">
                Period {period.id.split('-')[1] || '1'} ({period.duration} minutes)
              </h3>
              {/* This would contain the formation display */}
              <div className="bg-green-900 rounded-md p-4 min-h-[300px] flex items-center justify-center">
                <p className="text-white">Formation selector will go here</p>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p>No periods configured for this team. Add a period to start team selection.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
