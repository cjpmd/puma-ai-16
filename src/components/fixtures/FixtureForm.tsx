
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { fixtureFormSchema, FixtureFormData } from "./schemas/fixtureFormSchema";
import { FixtureDetailsForm } from "./FixtureDetailsForm";
import { TeamDetailsForm } from "./TeamDetailsForm";
import { Fixture } from "@/types/fixture";
import { useFixtureForm } from "./hooks/useFixtureForm";

interface FixtureFormProps {
  onSubmit: (data: FixtureFormData) => Promise<any>;
  selectedDate?: Date;
  editingFixture?: Fixture | null;
  players?: any[];
  isSubmitting?: boolean;
  showDateSelector?: boolean;
}

export const FixtureForm = ({
  onSubmit,
  selectedDate,
  editingFixture,
  players = [],
  isSubmitting = false,
  showDateSelector = false,
}: FixtureFormProps) => {
  console.log("FixtureForm - editingFixture:", editingFixture);
  console.log("FixtureForm - fixture_team_scores:", editingFixture?.fixture_team_scores);

  const form = useForm<FixtureFormData>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: {
      opponent: "",
      location: "",
      team_name: "Broughty Pumas 2015s",
      format: "7-a-side",
      number_of_teams: "1",
      is_home: true,
      date: selectedDate,
      motm_player_ids: ["", ""],
      team_1_score: 0,
      opponent_1_score: 0,
      team_2_score: 0,
      opponent_2_score: 0,
      team_times: [
        {
          meeting_time: "",
          start_time: "",
          end_time: "",
          performance_category: "MESSI"
        },
        {
          meeting_time: "",
          start_time: "",
          end_time: "",
          performance_category: "MESSI"
        }
      ]
    },
  });

  // Initialize form with editing fixture data when it changes
  useEffect(() => {
    if (editingFixture) {
      console.log("Initializing form with fixture:", editingFixture);
      
      // Extract team scores
      const team1Score = editingFixture.team_1_score !== undefined 
        ? editingFixture.team_1_score 
        : editingFixture.fixture_team_scores?.find(s => s.team_number === 1)?.score || 0;
      
      const opponent1Score = editingFixture.opponent_1_score !== undefined 
        ? editingFixture.opponent_1_score 
        : editingFixture.fixture_team_scores?.find(s => s.team_number === 1)?.opponent_score || 0;
      
      const team2Score = editingFixture.team_2_score !== undefined 
        ? editingFixture.team_2_score 
        : editingFixture.fixture_team_scores?.find(s => s.team_number === 2)?.score || 0;
      
      const opponent2Score = editingFixture.opponent_2_score !== undefined 
        ? editingFixture.opponent_2_score 
        : editingFixture.fixture_team_scores?.find(s => s.team_number === 2)?.opponent_score || 0;
      
      // Extract MOTM player IDs for all teams
      const motmPlayerIds = [];
      
      // Get main MOTM for team 1
      const team1Motm = editingFixture.fixture_team_scores?.find(s => s.team_number === 1)?.motm_player_id || editingFixture.motm_player_id || "";
      motmPlayerIds.push(team1Motm);
      
      // Get MOTM for team 2
      const team2Motm = editingFixture.fixture_team_scores?.find(s => s.team_number === 2)?.motm_player_id || "";
      motmPlayerIds.push(team2Motm);
      
      console.log("MOTM player IDs:", motmPlayerIds);
      
      // Extract team times with performance categories
      const teamTimes = [];
      
      // Get team 1 times and performance
      const team1Times = editingFixture.fixture_team_times?.find(t => t.team_number === 1) || {};
      teamTimes.push({
        meeting_time: team1Times.meeting_time || editingFixture.meeting_time || "",
        start_time: team1Times.start_time || editingFixture.start_time || "",
        end_time: team1Times.end_time || editingFixture.end_time || "",
        performance_category: team1Times.performance_category || "MESSI"
      });
      
      // Get team 2 times and performance
      const team2Times = editingFixture.fixture_team_times?.find(t => t.team_number === 2) || {};
      teamTimes.push({
        meeting_time: team2Times.meeting_time || "",
        start_time: team2Times.start_time || "",
        end_time: team2Times.end_time || "",
        performance_category: team2Times.performance_category || "MESSI"
      });
      
      // Set form values
      form.reset({
        opponent: editingFixture.opponent || "",
        location: editingFixture.location || "",
        team_name: editingFixture.team_name || "Broughty Pumas 2015s",
        format: editingFixture.format || "7-a-side",
        number_of_teams: editingFixture.number_of_teams?.toString() || "1",
        is_home: editingFixture.is_home !== undefined ? editingFixture.is_home : true,
        date: editingFixture.date ? new Date(editingFixture.date) : selectedDate,
        motm_player_ids: motmPlayerIds,
        team_1_score: team1Score,
        opponent_1_score: opponent1Score,
        team_2_score: team2Score,
        opponent_2_score: opponent2Score,
        team_times: teamTimes
      });
    }
  }, [editingFixture, selectedDate, form]);
  
  const handleSubmit = async (data: FixtureFormData) => {
    console.log("Form data being submitted:", data);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FixtureDetailsForm form={form} showDateSelector={showDateSelector} />
        
        <TeamDetailsForm form={form} players={players} />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (editingFixture ? "Update Fixture" : "Create Fixture")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
