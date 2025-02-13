
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
  const form = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      opponent: editingFixture?.opponent || "",
      location: editingFixture?.location || "",
      number_of_teams: editingFixture?.number_of_teams?.toString() || "1",
      format: editingFixture?.format || "7-a-side",
      home_score: Array(editingFixture?.number_of_teams || 1).fill(""),
      away_score: Array(editingFixture?.number_of_teams || 1).fill(""),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {showDateSelector && (
          <div className="space

-y-2">
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
