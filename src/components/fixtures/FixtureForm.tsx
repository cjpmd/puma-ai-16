import React, { useEffect } from "react";
import { format } from "date-fns";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TeamDetailsForm } from "./TeamDetailsForm";
import { FixtureDetailsForm } from "./FixtureDetailsForm";
import { TeamCard } from "./TeamCard";
import { fixtureFormSchema, FixtureFormData } from "./schemas/fixtureFormSchema";
import { useFixtureForm } from "./hooks/useFixtureForm";
import { useTeamTimes } from "./hooks/useTeamTimes";
import { Loader2 } from "lucide-react";
import { Fixture } from "@/types/fixture";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface FixtureFormProps {
  onSubmit?: (data: FixtureFormData) => Promise<any>;
  selectedDate?: Date;
  editingFixture?: any;
  players?: any[];
  isSubmitting?: boolean;
  showDateSelector?: boolean;
}

export const FixtureForm = ({ 
  onSubmit: externalOnSubmit, 
  selectedDate, 
  editingFixture,
  players,
  isSubmitting: externalIsSubmitting,
  showDateSelector = false
}: FixtureFormProps) => {
  const getInitialMotmPlayerIds = () => {
    if (editingFixture?.fixture_team_scores && editingFixture.fixture_team_scores.length > 0) {
      const sortedScores = [...editingFixture.fixture_team_scores].sort((a, b) => a.team_number - b.team_number);
      const motmPlayerIds = sortedScores.map(score => score.motm_player_id || "");
      console.log("Initial MOTM player IDs from team scores:", motmPlayerIds);
      return motmPlayerIds;
    }

    if (editingFixture?.motm_player_id || editingFixture?.potm_player_id) {
      const playerId = editingFixture?.motm_player_id || editingFixture?.potm_player_id;
      const numberOfTeams = editingFixture?.number_of_teams || 1;
      const motmPlayerIds = Array(numberOfTeams).fill("");
      motmPlayerIds[0] = playerId;
      console.log("Initial MOTM player IDs from single MOTM:", motmPlayerIds);
      return motmPlayerIds;
    }

    const emptyIds = Array(editingFixture?.number_of_teams || 1).fill("");
    console.log("Default empty MOTM player IDs:", emptyIds);
    return emptyIds;
  };

  const getInitialTeamTimes = () => {
    if (editingFixture?.fixture_team_times && editingFixture?.fixture_team_times.length > 0) {
      return editingFixture.fixture_team_times.map((time: any) => ({
        meeting_time: time.meeting_time || "",
        start_time: time.start_time || "",
        end_time: time.end_time || "",
        performance_category: time.performance_category || "MESSI"
      }));
    }
    return Array(editingFixture?.number_of_teams || 1).fill({
      meeting_time: "",
      start_time: "",
      end_time: "",
      performance_category: "MESSI"
    });
  };

  const initialMotmPlayerIds = getInitialMotmPlayerIds();
  console.log("Initial MOTM player IDs before form creation:", initialMotmPlayerIds);

  const form = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      opponent: editingFixture?.opponent || "",
      location: editingFixture?.location || "",
      number_of_teams: editingFixture?.number_of_teams?.toString() || "1",
      format: editingFixture?.format || "7-a-side",
      team_1_score: editingFixture?.team_1_score || 0,
      opponent_1_score: editingFixture?.opponent_1_score || 0,
      team_2_score: editingFixture?.team_2_score || 0,
      opponent_2_score: editingFixture?.opponent_2_score || 0,
      motm_player_ids: initialMotmPlayerIds,
      team_times: getInitialTeamTimes(),
      is_home: editingFixture?.is_home ?? true,
      team_name: editingFixture?.team_name || "Broughty Pumas 2015s",
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    },
  });

  const fixtureFormState = useFixtureForm({ 
    fixture: editingFixture,
    onSuccess: externalOnSubmit
  });
  
  const watchNumberOfTeams = parseInt(fixtureFormState.form.watch("number_of_teams") || "1");
  const watchOpponent = fixtureFormState.form.watch("opponent");
  const watchIsHome = fixtureFormState.form.watch("is_home");
  const watchMotmPlayerIds = fixtureFormState.form.watch("motm_player_ids");
  
  const isSubmitting = fixtureFormState.isSubmitting || externalIsSubmitting;

  useEffect(() => {
    console.log("Current form values:", fixtureFormState.form.getValues());
    console.log("MOTM player IDs:", watchMotmPlayerIds);
  }, [fixtureFormState.form, watchNumberOfTeams, watchMotmPlayerIds]);

  useTeamTimes(fixtureFormState.form, editingFixture, watchNumberOfTeams);

  useEffect(() => {
    const currentMotmIds = [...(fixtureFormState.form.getValues().motm_player_ids || [])];
    
    if (currentMotmIds.length !== watchNumberOfTeams) {
      const newMotmIds = Array(watchNumberOfTeams).fill("");
      
      for (let i = 0; i < Math.min(currentMotmIds.length, watchNumberOfTeams); i++) {
        newMotmIds[i] = currentMotmIds[i] || "";
      }
      
      console.log("Resizing MOTM player IDs array after team count change:", newMotmIds);
      fixtureFormState.form.setValue('motm_player_ids', newMotmIds, { shouldDirty: true });
    }
  }, [watchNumberOfTeams, fixtureFormState.form]);

  useEffect(() => {
    if (editingFixture) {
      const motmIds = getInitialMotmPlayerIds();
      console.log("Resetting MOTM player IDs from fixture_team_scores:", motmIds);
      fixtureFormState.form.setValue('motm_player_ids', motmIds, { shouldDirty: false });
    }
  }, [editingFixture, fixtureFormState.form]);

  const getScoreLabel = (isHomeScore: boolean, teamIndex: number) => {
    const homeTeam = watchIsHome ? "Broughty Pumas 2015s" : watchOpponent;
    const awayTeam = watchIsHome ? watchOpponent : "Broughty Pumas 2015s";
    const teamLabel = isHomeScore ? homeTeam : awayTeam;
    const performanceCategory = fixtureFormState.form.watch(`team_times.${teamIndex}.performance_category`) || "MESSI";

    if (teamLabel === "Broughty Pumas 2015s") {
      return `Team ${teamIndex + 1} ${performanceCategory} Score`;
    }
    return `${teamLabel} Score`;
  };

  const getMotmLabel = (teamIndex: number) => {
    const performanceCategory = fixtureFormState.form.watch(`team_times.${teamIndex}.performance_category`) || "MESSI";
    return `Team ${teamIndex + 1} ${performanceCategory} Player of the Match`;
  };

  // Handle form submission using the fixture form state's onSubmit
  const handleFormSubmit = (data: FixtureFormData) => {
    return fixtureFormState.onSubmit(data);
  };

  return (
    <Form {...fixtureFormState.form}>
      <form onSubmit={fixtureFormState.form.handleSubmit(handleFormSubmit)} className="space-y-4">
        {showDateSelector && (
          <div className="space-y-2">
            <FormLabel>Date *</FormLabel>
            <Input 
              type="date" 
              value={format(selectedDate || new Date(), 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                form.setValue('date', format(date || new Date(), 'yyyy-MM-dd'));
              }}
            />
          </div>
        )}

        <TeamDetailsForm form={fixtureFormState.form} />
        <FixtureDetailsForm form={fixtureFormState.form} />

        {Array.from({ length: watchNumberOfTeams }).map((_, index) => (
          <TeamCard
            key={index}
            index={index}
            form={fixtureFormState.form}
            players={players || fixtureFormState.players}
            getScoreLabel={getScoreLabel}
            getMotmLabel={getMotmLabel}
          />
        ))}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {editingFixture ? "Saving Changes..." : "Adding Fixture..."}
            </>
          ) : (
            editingFixture ? "Save Changes" : "Add Fixture"
          )}
        </Button>
      </form>
    </Form>
  );
};
