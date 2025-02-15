
import { Card, CardContent } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { useState, useEffect } from "react";
import type { Fixture, FixtureTeamScore, FixtureTeamTime } from "@/types/fixture";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FixtureCardHeader } from "./FixtureCard/FixtureCardHeader";
import { TeamScores } from "./FixtureCard/TeamScores";
import { TeamSelectionDialog } from "./FixtureCard/TeamSelectionDialog";

interface FixtureCardProps {
  fixture: Fixture;
  onEdit: (fixture: Fixture) => void;
  onDelete: (fixtureId: string) => void;
  onDateChange: (newDate: Date) => void;
}

export const FixtureCard = ({
  fixture,
  onEdit,
  onDelete,
  onDateChange
}: FixtureCardProps) => {
  const [isTeamSelectionOpen, setIsTeamSelectionOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [motmName, setMotmName] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: teamData,
    isLoading,
    refetch: refetchTeamData
  } = useQuery({
    queryKey: ["team-data", fixture.id],
    queryFn: async () => {
      console.log("Fetching team data for fixture:", fixture.id);
      const [scoresResponse, timesResponse] = await Promise.all([
        supabase
          .from('fixture_team_scores')
          .select('*')
          .eq('fixture_id', fixture.id)
          .order('team_number'),
        supabase
          .from('fixture_team_times')
          .select('*')
          .eq('fixture_id', fixture.id)
          .order('team_number')
      ]);

      if (scoresResponse.error) {
        console.error("Error fetching scores:", scoresResponse.error);
        throw scoresResponse.error;
      }
      if (timesResponse.error) {
        console.error("Error fetching times:", timesResponse.error);
        throw timesResponse.error;
      }

      console.log("Got scores:", scoresResponse.data);
      console.log("Got times:", timesResponse.data);

      // If there are no scores yet, create default scores
      if (!scoresResponse.data || scoresResponse.data.length === 0) {
        const defaultScores = Array.from(
          { length: fixture.number_of_teams || 1 },
          (_, index) => ({
            team_number: index + 1,
            score: 0,
            opponent_score: 0,
            fixture_id: fixture.id
          })
        );

        console.log("Creating default scores:", defaultScores);

        const { error: insertError } = await supabase
          .from('fixture_team_scores')
          .insert(defaultScores);

        if (insertError) {
          console.error('Error creating default scores:', insertError);
          return {
            scores: defaultScores,
            times: timesResponse.data || []
          };
        }

        // Refetch scores after inserting defaults
        const { data: updatedScores, error: refetchError } = await supabase
          .from('fixture_team_scores')
          .select('*')
          .eq('fixture_id', fixture.id)
          .order('team_number');

        if (refetchError) {
          console.error("Error refetching scores:", refetchError);
          throw refetchError;
        }

        console.log("Updated scores:", updatedScores);

        return {
          scores: updatedScores,
          times: timesResponse.data || []
        };
      }

      return {
        scores: scoresResponse.data,
        times: timesResponse.data || []
      };
    },
    enabled: !!fixture.id
  });

  useEffect(() => {
    const fetchMotmName = async () => {
      if (!fixture.motm_player_id) {
        setMotmName(null);
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .select('name')
        .eq('id', fixture.motm_player_id)
        .single();

      if (error) {
        console.error('Error fetching MOTM player:', error);
        setMotmName('Unknown Player');
        return;
      }

      if (data) {
        setMotmName(data.name);
      }
    };

    fetchMotmName();
  }, [fixture.motm_player_id]);

  // Merge fixture data with team data for editing
  const getEditingFixture = (): Fixture => {
    const editData: Fixture = { ...fixture };
    
    if (teamData) {
      teamData.scores.forEach((score, index) => {
        const teamKey = `team_${index + 1}_score`;
        const opponentKey = `opponent_${index + 1}_score`;
        editData[teamKey] = score.score;
        editData[opponentKey] = score.opponent_score;
      });
      
      editData.team_times = teamData.times;
    }
    
    return editData;
  };

  return (
    <>
      <Card className="hover:bg-accent/50 transition-colors">
        <FixtureCardHeader
          fixture={fixture}
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={setIsCalendarOpen}
          onEdit={() => onEdit(getEditingFixture())}
          onDelete={onDelete}
          onTeamSelection={() => setIsTeamSelectionOpen(true)}
          onDateChange={onDateChange}
        />
        <CardContent onClick={() => onEdit(getEditingFixture())} className="cursor-pointer">
          <p className="font-semibold text-muted-foreground mb-4 text-sm">
            Date: {format(parseISO(fixture.date), "MMMM do, yyyy")}
          </p>

          {!isLoading && teamData && (
            <>
              {fixture.number_of_teams > 1 && (
                <div className="mb-4 space-y-4">
                  <h3 className="font-semibold">Team 1</h3>
                  <TeamScores
                    scores={teamData.scores.filter(s => s.team_number === 1)}
                    times={teamData.times.filter(t => t.team_number === 1)}
                    fixture={fixture}
                  />
                  
                  <h3 className="font-semibold mt-6">Team 2</h3>
                  <TeamScores
                    scores={teamData.scores.filter(s => s.team_number === 2)}
                    times={teamData.times.filter(t => t.team_number === 2)}
                    fixture={fixture}
                  />
                </div>
              )}
              
              {fixture.number_of_teams === 1 && (
                <TeamScores
                  scores={teamData.scores}
                  times={teamData.times}
                  fixture={fixture}
                />
              )}
            </>
          )}

          <div className="space-y-1 mt-4 text-sm text-muted-foreground">
            {fixture.location && <p>Location: {fixture.location}</p>}
            {fixture.motm_player_id && motmName && (
              <p>Player of the Match: {motmName}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <TeamSelectionDialog
        isOpen={isTeamSelectionOpen}
        onOpenChange={setIsTeamSelectionOpen}
        fixture={fixture}
        onSuccess={() => {
          refetchTeamData();
          queryClient.invalidateQueries(["team-data", fixture.id]);
        }}
      />
    </>
  );
};
