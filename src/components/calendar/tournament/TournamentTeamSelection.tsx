
import { useEffect, useState } from "react";
import { useTeamSelection } from "@/hooks/useTeamSelection";
import { FormationSelector } from "@/components/FormationSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormationView } from "@/components/fixtures/FormationView";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PerformanceCategory, transformDbPlayerToPlayer } from "@/types/player";

interface TeamSelection {
  playerId: string;
  position: string;
  is_substitute: boolean;
  performanceCategory?: PerformanceCategory;
}

interface TournamentTeamSelectionProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: {
    id: string;
    teams: Array<{ id: string; name: string; category: string }>;
    format: string;
  };
  onSuccess: () => void;
}

export const TournamentTeamSelection = ({ 
  isOpen,
  onOpenChange,
  tournament,
  onSuccess,
}: TournamentTeamSelectionProps) => {
  const { selectedPlayers, clearSelectedPlayers } = useTeamSelection();
  const [teamSelections, setTeamSelections] = useState<Record<string, Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [teamFormationTemplates, setTeamFormationTemplates] = useState<Record<string, string>>({});

  const { data: playersData } = useQuery({
    queryKey: ["all-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Transform players data to match the expected Player interface
  const players = (playersData || []).map(transformDbPlayerToPlayer);

  useEffect(() => {
    if (isOpen) {
      clearSelectedPlayers();
    }
  }, [isOpen, clearSelectedPlayers]);

  const handleSelectionChange = (teamId: string, selections: Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>) => {
    // Update local state
    setTeamSelections(prev => ({
      ...prev,
      [teamId]: selections
    }));
  };

  const handleTemplateChange = (teamId: string, template: string) => {
    console.log(`Changing template for team ${teamId} to ${template}`);
    setTeamFormationTemplates(prev => ({
      ...prev,
      [teamId]: template
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
          performanceCategory: value.performanceCategory || 'MESSI' as PerformanceCategory
        }));
      });
      
      // Check if tournament_team_players table exists before inserting
      const createTable = async () => {
        try {
          // Create table if it doesn't exist
          await supabase.rpc('create_table_if_not_exists', {
            p_table_name: 'tournament_team_players',
            p_columns: `
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              tournament_team_id uuid REFERENCES tournament_teams(id),
              player_id uuid REFERENCES players(id),
              position text NOT NULL,
              is_substitute boolean DEFAULT false,
              is_captain boolean DEFAULT false,
              performance_category text DEFAULT 'MESSI',
              created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
              updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
            `
          });
        } catch (error) {
          console.error("Error creating tournament_team_players table:", error);
        }
      };
      
      await createTable();
      
      // Insert selections into database using the tournament_team_players table
      const insertPromises = Object.entries(formattedSelections).flatMap(([teamId, selections]) => 
        selections.map(selection => {
          const insertData = {
            tournament_team_id: teamId,
            player_id: selection.playerId,
            position: selection.position,
            is_substitute: selection.is_substitute,
            performance_category: selection.performanceCategory
          };
          
          return supabase
            .from('tournament_team_players')
            .upsert(insertData);
        })
      );
      
      const results = await Promise.all(insertPromises);
      const errors = results.filter(r => r.error).map(r => r.error);
      
      if (errors.length > 0) {
        console.error("Errors saving selections:", errors);
        throw new Error("Some selections could not be saved");
      }
      
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
          <DialogTitle>Team Selection for Tournament</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {tournament.teams && tournament.teams.map(team => (
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
                  format={tournament.format as any}
                  teamName={team.category}
                  onSelectionChange={(selections) => {
                    // Type casting to ensure compatibility with PerformanceCategory
                    const typedSelections = Object.entries(selections).reduce((acc, [key, value]) => {
                      return {
                        ...acc,
                        [key]: {
                          ...value,
                          performanceCategory: value.performanceCategory as PerformanceCategory
                        }
                      };
                    }, {} as Record<string, { playerId: string; position: string; performanceCategory?: PerformanceCategory }>);
                    
                    handleSelectionChange(team.id, typedSelections);
                  }}
                  selectedPlayers={selectedPlayers}
                  availablePlayers={players || []}
                  formationTemplate={teamFormationTemplates[team.id] || "All"}
                  onTemplateChange={(template) => handleTemplateChange(team.id, template)}
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
