
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { DraggableFormation } from "@/components/formation/DraggableFormation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubstitutesList } from "@/components/formation/SubstitutesList";
import { ArrowRight } from "lucide-react";
import { isPlayerSubstitution } from "@/components/formation/utils/playerUtils";

interface TeamPreviewCardProps {
  period: { id: string; duration: number };
  index: number;
  teamId: string;
  fixture: any;
  teamSelections: Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>;
  availablePlayers: any[];
  teamSquadPlayers: string[];
  performanceCategories: Record<string, string>;
  onPerformanceCategoryChange: (teamId: string, periodId: string, category: string) => void;
  onDurationChange: (teamId: string, periodId: string, duration: number) => void;
  onDeletePeriod: (teamId: string, periodId: string) => void;
  handleFormationChange: (teamId: string, periodId: string, selections: Record<string, { playerId: string; position: string }>) => void;
  checkIsSubstitution: (teamId: string, periodIndex: number, position: string) => boolean;
}

export const TeamPreviewCard = ({
  period,
  index,
  teamId,
  fixture,
  teamSelections,
  availablePlayers,
  teamSquadPlayers,
  performanceCategories,
  onPerformanceCategoryChange,
  onDurationChange,
  onDeletePeriod,
  handleFormationChange,
  checkIsSubstitution
}: TeamPreviewCardProps) => {
  const selectionKey = `${teamId}-${period.id}`;
  
  return (
    <Card key={period.id} className="relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Period {index + 1}</CardTitle>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label>Performance Category:</Label>
            <select
              value={performanceCategories[selectionKey] || 'MESSI'}
              onChange={(e) => onPerformanceCategoryChange(teamId, period.id, e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="MESSI">Messi</option>
              <option value="RONALDO">Ronaldo</option>
              <option value="JAGS">Jags</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Label>Duration (mins):</Label>
            <Input
              type="number"
              value={period.duration}
              onChange={(e) => onDurationChange(teamId, period.id, parseInt(e.target.value))}
              className="w-20"
            />
          </div>
          {index > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDeletePeriod(teamId, period.id)}
            >
              Remove Period
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <DraggableFormation
          format={fixture?.format as "7-a-side" || "7-a-side"}
          availablePlayers={availablePlayers.filter(p => 
            teamSquadPlayers.includes(p.id)
          )}
          initialSelections={teamSelections[selectionKey] || {}}
          onSelectionChange={(selections) => handleFormationChange(teamId, period.id, selections)}
          renderSubstitutionIndicator={(position) => 
            checkIsSubstitution(teamId, index, position) && (
              <span className="absolute -top-4 -right-3 text-amber-500">
                <ArrowRight className="h-4 w-4" />
              </span>
            )
          }
        />
        
        <SubstitutesList
          maxSubstitutes={5}
          selections={teamSelections[selectionKey] || {}}
          availablePlayers={availablePlayers.filter(p => 
            teamSquadPlayers.includes(p.id)
          )}
          onSelectionChange={(slotId, playerId, position) => {
            // Create a new formation change with this substitution
            const currentSelections = teamSelections[selectionKey] || {};
            const updatedSelections = {
              ...currentSelections,
              [slotId]: {
                playerId,
                position
              }
            };
            handleFormationChange(teamId, period.id, updatedSelections);
          }}
          selectedPlayers={new Set(
            Object.values(teamSelections[selectionKey] || {})
              .map(s => s.playerId)
              .filter(id => id !== 'unassigned')
          )}
        />
      </CardContent>
    </Card>
  );
};
