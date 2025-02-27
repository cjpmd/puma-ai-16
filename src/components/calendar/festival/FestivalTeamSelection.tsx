
import { useEffect, useState } from "react";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import { FormationSelector } from "@/components/FormationSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationView } from "@/components/fixtures/FormationView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: string;
}

interface FestivalTeamSelectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  festival: {
    id: string;
    teams: Array<{ id: string; name: string; category: string }>;
    format: string;
  };
  onSuccess: () => void;
}

export const FestivalTeamSelection = ({ 
  isOpen,
  onOpenChange,
  festival,
  onSuccess,
}: FestivalTeamSelectionProps) => {
  const { selectedPlayers, clearSelectedPlayers } = useTeamSelection();
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: string }>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: players } = useQuery({
    queryKey: ["all-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (isOpen) {
      clearSelectedPlayers();
    }
  }, [isOpen, clearSelectedPlayers]);

  const handleSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: string }>) => {
    // Update local state
    setTeamSelections(prev => ({
      ...prev,
      [teamId]: selections
    }));
  };

  const formatSelectionsForFormation = (selections: Record<string, { playerId: string; position: string }>) => {
    return Object.entries(selections)
      .filter(([_, value]) => !value.position.startsWith('sub-'))
      .map(([_, value]) => ({
        position: value.position.split('-')[0].toUpperCase(),
        playerId: value.playerId
      }));
  };

  const handleSaveSelections = async () => {
    setIsSaving(true);
    try {
      // Format all team selections for saving to database
      const formattedSelections: Record<string, TeamSelection[]> = {};
      
      Object.entries(teamSelections).forEach(([teamId, selections]) => {
        formattedSelections[teamId] = Object.entries(selections).map(([_, value]) => ({
          playerId: value.playerId,
          position: value.position,
          is_substitute: value.position.startsWith('sub-'),
          performanceCategory: value.performanceCategory || 'MESSI'
        }));
      });
      
      // Call API to save selections
      const { error } = await supabase
        .from('festival_team_selections')
        .upsert(
          Object.entries(formattedSelections).flatMap(([teamId, selections]) => 
            selections.map(selection => ({
              festival_id: festival.id,
              team_id: teamId,
              player_id: selection.playerId,
              position: selection.position,
              is_substitute: selection.is_substitute,
              performance_category: selection.performanceCategory
            }))
          )
        );
      
      if (error) throw error;
      
      // Call onSuccess callback
      onSuccess();
      
    } catch (error) {
      console.error('Error saving team selections:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Team Selection for Festival</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {festival.teams && festival.teams.map(team => (
            <Card key={team.id} className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">{team.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamSelections[team.id] && (
                  <FormationView
                    positions={formatSelectionsForFormation(teamSelections[team.id])}
                    players={players || []}
                    periodNumber={1}
                    duration={20}
                  />
                )}
                <FormationSelector
                  format={festival.format as any}
                  teamName={team.category}
                  onSelectionChange={(selections) => handleSelectionChange(team.id, selections)}
                  selectedPlayers={selectedPlayers}
                  availablePlayers={players || []}
                />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end mt-8 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSelections} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Selections'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
