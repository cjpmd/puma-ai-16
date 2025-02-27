
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Form, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TeamDetailsForm } from "./TeamDetailsForm";
import { FixtureDetailsForm } from "./FixtureDetailsForm";
import { TeamCard } from "./TeamCard";
import { fixtureFormSchema, FixtureFormData } from "./schemas/fixtureFormSchema";
import { useFixtureForm } from "./hooks/useFixtureForm";
import { useTeamTimes } from "./hooks/useTeamTimes";
import { Loader2 } from "lucide-react";

interface FixtureFormProps {
  onSubmit: (data: FixtureFormData) => Promise<FixtureFormData>;
  selectedDate?: Date;
  editingFixture?: any;
  players?: any[];
  isSubmitting?: boolean;
  showDateSelector?: boolean;
}

export const FixtureForm = ({ 
  onSubmit, 
  selectedDate, 
  editingFixture,
  players,
  isSubmitting: externalIsSubmitting,
  showDateSelector = false
}: FixtureFormProps) => {
  // Initialize the form with the editing fixture data if available
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

  // Get initial MOTM player IDs, handling both single and multiple team cases
  const getInitialMotmPlayerIds = () => {
    // If we have multiple teams with potentially different MOTM players
    if (editingFixture?.fixture_team_scores && editingFixture?.fixture_team_scores.length > 0) {
      // Extract MOTM player IDs from team scores if available
      const motmPlayerIds = editingFixture.fixture_team_scores.map((score: any) => 
        score.motm_player_id || ""
      );
      
      // If we have at least one MOTM player, use that array
      if (motmPlayerIds.length > 0) {
        console.log("Using MOTM player IDs from team scores:", motmPlayerIds);
        return motmPlayerIds;
      }
    }
    
    // If we have a single MOTM player for the whole fixture
    if (editingFixture?.motm_player_id || editingFixture?.potm_player_id) {
      const playerId = editingFixture?.motm_player_id || editingFixture?.potm_player_id;
      console.log("Using single MOTM player ID:", playerId);
      return Array(editingFixture?.number_of_teams || 1).fill("").map((_, i) => 
        i === 0 ? playerId : ""
      );
    }
    
    // Default empty array of appropriate length
    const emptyIds = Array(editingFixture?.number_of_teams || 1).fill("");
    console.log("Using default empty MOTM player IDs:", emptyIds);
    return emptyIds;
  };

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
      motm_player_ids: getInitialMotmPlayerIds(),
      team_times: getInitialTeamTimes(),
      is_home: editingFixture?.is_home ?? true,
      team_name: editingFixture?.team_name || "Broughty Pumas 2015s",
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    },
  });

  const { handleSubmit, isSubmitting: localIsSubmitting } = useFixtureForm({ onSubmit, editingFixture, selectedDate });
  const watchNumberOfTeams = parseInt(form.watch("number_of_teams") || "1");
  const watchOpponent = form.watch("opponent");
  const watchIsHome = form.watch("is_home");
  const watchMotmPlayerIds = form.watch("motm_player_ids");
  
  // Combine both local and external isSubmitting state for better feedback
  const isSubmitting = localIsSubmitting || externalIsSubmitting;

  // Update MOTM player IDs when number of teams changes
  useEffect(() => {
    const currentMotmIds = form.getValues().motm_player_ids || [];
    const newTeamsCount = watchNumberOfTeams;
    
    if (currentMotmIds.length !== newTeamsCount) {
      // Resize the motm_player_ids array to match the number of teams
      const newMotmIds = [...currentMotmIds];
      
      // If we're adding teams, fill with empty strings
      while (newMotmIds.length < newTeamsCount) {
        newMotmIds.push("");
      }
      
      // If we're removing teams, truncate the array
      if (newMotmIds.length > newTeamsCount) {
        newMotmIds.length = newTeamsCount;
      }
      
      console.log("Updating MOTM player IDs array size:", newMotmIds);
      form.setValue('motm_player_ids', newMotmIds, { shouldDirty: true });
    }
  }, [watchNumberOfTeams, form]);

  // Log form values when they change
  useEffect(() => {
    console.log("Current form values:", form.getValues());
    console.log("MOTM player IDs:", watchMotmPlayerIds);
  }, [form, watchNumberOfTeams, watchMotmPlayerIds]);

  useTeamTimes(form, editingFixture, watchNumberOfTeams);

  const getScoreLabel = (isHomeScore: boolean, teamIndex: number) => {
    const homeTeam = watchIsHome ? "Broughty Pumas 2015s" : watchOpponent;
    const awayTeam = watchIsHome ? watchOpponent : "Broughty Pumas 2015s";
    const teamLabel = isHomeScore ? homeTeam : awayTeam;
    const performanceCategory = form.watch(`team_times.${teamIndex}.performance_category`) || "MESSI";

    if (teamLabel === "Broughty Pumas 2015s") {
      return `Team ${teamIndex + 1} ${performanceCategory} Score`;
    }
    return `${teamLabel} Score`;
  };

  const getMotmLabel = (teamIndex: number) => {
    const performanceCategory = form.watch(`team_times.${teamIndex}.performance_category`) || "MESSI";
    return `Team ${teamIndex + 1} ${performanceCategory} Player of the Match`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

        <TeamDetailsForm form={form} />
        <FixtureDetailsForm form={form} />

        {Array.from({ length: watchNumberOfTeams }).map((_, index) => (
          <TeamCard
            key={index}
            index={index}
            form={form}
            players={players}
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
