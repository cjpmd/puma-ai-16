
import React from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      motm_player_ids: editingFixture?.potm_player_id 
        ? [editingFixture.potm_player_id]
        : Array(editingFixture?.number_of_teams || 1).fill(""),
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

  const handleSubmit = async (data: FixtureFormData) => {
    try {
      // First submit the form data
      const savedData = await onSubmit(data);
      
      if (savedData && savedData.id) {
        // Send WhatsApp notification
        const { error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            type: 'FIXTURE',
            date: format(selectedDate || new Date(), 'dd/MM/yyyy'),
            time: data.team_times[0]?.meeting_time || null,
            opponent: data.opponent,
            location: data.location,
            category: data.team_name,
            eventId: savedData.id
          }
        });

        if (notificationError) {
          console.error('Error sending notifications:', notificationError);
          toast({
            title: "Warning",
            description: "Fixture saved but there was an error sending notifications",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error handling form submission:', error);
      toast({
        title: "Error",
        description: "Failed to save fixture and send notifications",
        variant: "destructive",
      });
    }
  };

  const watchNumberOfTeams = parseInt(form.watch("number_of_teams") || "1");
  const watchOpponent = form.watch("opponent");
  const watchIsHome = form.watch("is_home");

  useTeamTimes(form, editingFixture, watchNumberOfTeams);

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
        >
          {editingFixture ? "Save Changes" : "Add Fixture"}
        </Button>
      </form>
    </Form>
  );
};
