
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FixtureFormProps {
  onSubmit: (data: FixtureFormData) => void;
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
  isSubmitting,
  showDateSelector = false
}: FixtureFormProps) => {
  const { toast } = useToast();
  const form = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      opponent: editingFixture?.opponent || "",
      location: editingFixture?.location || "",
      number_of_teams: editingFixture?.number_of_teams?.toString() || "1",
      format: editingFixture?.format || "7-a-side",
      home_score: editingFixture?.home_score?.toString() || "",
      away_score: editingFixture?.away_score?.toString() || "",
      motm_player_ids: Array(editingFixture?.number_of_teams || 1).fill(""),
      team_times: editingFixture?.team_times || [{ 
        meeting_time: "", 
        start_time: "", 
        end_time: "",
        performance_category: "MESSI"
      }],
      is_home: editingFixture?.is_home ?? true,
      team_name: editingFixture?.team_name || "Broughty Pumas 2015s",
    },
  });

  const watchNumberOfTeams = parseInt(form.watch("number_of_teams") || "1");
  const watchOpponent = form.watch("opponent");
  const watchIsHome = form.watch("is_home");

  useEffect(() => {
    const fetchTeamTimes = async () => {
      if (!editingFixture?.id) return;

      const { data: teamTimes, error } = await supabase
        .from('fixture_team_times')
        .select('*')
        .eq('fixture_id', editingFixture.id);

      if (error) {
        console.error("Error fetching team times:", error);
        return;
      }

      if (teamTimes) {
        const currentTeamTimes = form.getValues("team_times");
        const updatedTeamTimes = currentTeamTimes.map((time, index) => {
          const teamTime = teamTimes.find(t => t.team_number === index + 1);
          return {
            ...time,
            performance_category: teamTime?.performance_category || "MESSI",
            meeting_time: teamTime?.meeting_time || "",
            start_time: teamTime?.start_time || "",
            end_time: teamTime?.end_time || ""
          };
        });
        form.setValue("team_times", updatedTeamTimes);
      }
    };

    fetchTeamTimes();
  }, [editingFixture?.id, form]);

  useEffect(() => {
    const currentTimes = form.getValues("team_times");
    if (currentTimes.length !== watchNumberOfTeams) {
      const newTimes = Array(watchNumberOfTeams).fill(null).map((_, i) => 
        currentTimes[i] || { 
          meeting_time: "", 
          start_time: "", 
          end_time: "",
          performance_category: "MESSI"
        }
      );
      form.setValue("team_times", newTimes);
    }
  }, [watchNumberOfTeams, form]);

  const handleSubmit = async (data: FixtureFormData) => {
    try {
      // First, save or update the fixture
      const fixtureData = {
        opponent: data.opponent,
        location: data.location,
        team_name: data.team_name,
        format: data.format,
        number_of_teams: parseInt(data.number_of_teams || "1"),
        is_home: data.is_home,
        home_score: data.home_score ? parseInt(data.home_score) : null,
        away_score: data.away_score ? parseInt(data.away_score) : null,
        date: format(selectedDate || new Date(), "yyyy-MM-dd"),
      };

      let fixtureId = editingFixture?.id;

      // Handle fixture creation/update
      const fixtureResult = editingFixture?.id 
        ? await supabase
            .from('fixtures')
            .update(fixtureData)
            .eq('id', editingFixture.id)
            .select()
            .single()
        : await supabase
            .from('fixtures')
            .insert(fixtureData)
            .select()
            .single();

      if (fixtureResult.error) throw fixtureResult.error;
      fixtureId = fixtureResult.data.id;

      // Then save team times
      if (fixtureId) {
        const { error: teamTimesError } = await supabase
          .from('fixture_team_times')
          .upsert(
            data.team_times.map((teamTime, index) => ({
              fixture_id: fixtureId,
              team_number: index + 1,
              meeting_time: teamTime.meeting_time || null,
              start_time: teamTime.start_time || null,
              end_time: teamTime.end_time || null,
              performance_category: teamTime.performance_category || "MESSI"
            })),
            { onConflict: 'fixture_id,team_number' }
          );

        if (teamTimesError) {
          console.error("Error inserting team times:", teamTimesError);
          throw teamTimesError;
        }

        // Save team scores
        const { error: scoresError } = await supabase
          .from('fixture_team_scores')
          .upsert([
            {
              fixture_id: fixtureId,
              team_number: 1,
              score: parseInt(data.home_score) || 0
            },
            {
              fixture_id: fixtureId,
              team_number: 2,
              score: parseInt(data.away_score) || 0
            }
          ], { onConflict: 'fixture_id,team_number' });

        if (scoresError) {
          console.error("Error saving team scores:", scoresError);
          throw scoresError;
        }

        // Only call onSubmit after all data is saved successfully
        await onSubmit({
          ...data,
          id: fixtureId // Make sure to pass the fixture ID back
        });
      }

      toast({
        title: "Success",
        description: editingFixture ? "Fixture updated successfully" : "Fixture created successfully",
      });
    } catch (error) {
      console.error("Error saving fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save fixture",
      });
    }
  };

  const getScoreLabel = (isHomeScore: boolean, teamIndex: number) => {
    const homeTeam = watchIsHome ? "Broughty Pumas 2015s" : watchOpponent;
    const awayTeam = watchIsHome ? watchOpponent : "Broughty Pumas 2015s";
    const teamLabel = isHomeScore ? homeTeam : awayTeam;
    const performanceCategory = form.watch(`team_times.${teamIndex}.performance_category`);

    if (teamLabel === "Broughty Pumas 2015s") {
      return `Team ${teamIndex + 1} ${performanceCategory} Score`;
    }
    return `${teamLabel} Score`;
  };

  const getMotmLabel = (teamIndex: number) => {
    const performanceCategory = form.watch(`team_times.${teamIndex}.performance_category`);
    return `Team ${teamIndex + 1} ${performanceCategory} Man of the Match`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {showDateSelector && (
          <div className="space-y-2">
            <FormLabel>Date *</FormLabel>
            <Input 
              type="date" 
              value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} 
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
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
          {isSubmitting ? "Saving..." : editingFixture ? "Save Changes" : "Add Fixture"}
        </Button>
      </form>
    </Form>
  );
};
