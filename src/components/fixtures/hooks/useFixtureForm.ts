import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Fixture } from "@/types/fixture";

// Define the schema for fixture form validation
const fixtureFormSchema = z.object({
  opponent: z.string().min(1, "Opponent name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  location: z.string().optional(),
  category: z.string().optional(),
  format: z.string().min(1, "Format is required"),
  is_home: z.boolean().default(true),
  notes: z.string().optional(),
  team_id: z.string().optional(),
  team_name: z.string().optional(),
  number_of_teams: z.string().default("1"),
  team_1_score: z.number().optional(),
  team_2_score: z.number().optional(),
  opponent_1_score: z.number().optional(),
  opponent_2_score: z.number().optional(),
  motm_player_ids: z.array(z.string()).optional(),
  team_times: z.array(
    z.object({
      meeting_time: z.string().optional(),
      start_time: z.string().optional(),
      end_time: z.string().optional(),
      performance_category: z.string().default("MESSI")
    })
  ).optional()
});

export type FixtureFormData = z.infer<typeof fixtureFormSchema>;

interface UseFixtureFormProps {
  fixture?: any;
  onSuccess?: (data: any) => void;
}

// Generate a UUID
const generateUUID = () => uuidv4();

export const useFixtureForm = ({ fixture, onSuccess }: UseFixtureFormProps = {}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch team categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ["team-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch game formats for dropdown
  const { data: formats = [] } = useQuery({
    queryKey: ["game-formats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_formats")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    }
  });

  // Initialize form with fixture data if provided
  const form = useForm({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: fixture ? {
      opponent: fixture.opponent || "",
      date: fixture.date || "",
      time: fixture.time || "",
      location: fixture.location || "",
      category: fixture.category || "",
      format: fixture.format || "",
      is_home: fixture.is_home !== undefined ? fixture.is_home : true,
      notes: fixture.notes || "",
      team_id: fixture.team_id || "",
      team_name: fixture.team_name || "",
      number_of_teams: fixture.number_of_teams?.toString() || "1"
    } : {
      opponent: "",
      date: new Date().toISOString().split("T")[0],
      time: "",
      location: "",
      category: "",
      format: "",
      is_home: true,
      notes: "",
      team_id: "",
      team_name: "",
      number_of_teams: "1"
    }
  });

  // Reset form when fixture changes
  useEffect(() => {
    if (fixture) {
      form.reset({
        opponent: fixture.opponent || "",
        date: fixture.date || "",
        time: fixture.time || "",
        location: fixture.location || "",
        category: fixture.category || "",
        format: fixture.format || "",
        is_home: fixture.is_home !== undefined ? fixture.is_home : true,
        notes: fixture.notes || "",
        team_id: fixture.team_id || "",
        team_name: fixture.team_name || ""
      });
    }
  }, [fixture, form]);

  // Handle form submission
  const onSubmit = async (values: FixtureFormData) => {
    setIsSubmitting(true);
    try {
      const fixtureData = {
        ...values,
        number_of_teams: parseInt(values.number_of_teams || "1"),
        id: fixture?.id || generateUUID(),
        team_name: values.team_name || "Broughty Pumas 2015s",
        date: values.date // Ensure date is required
      };

      let result;
      if (fixture?.id) {
        const { data, error } = await supabase
          .from("fixtures")
          .update(fixtureData)
          .eq("id", fixture.id)
          .select();
        
        if (error) throw error;
        result = data?.[0];
      } else {
        const { data, error } = await supabase
          .from("fixtures")
          .insert(fixtureData)
          .select();
          
        if (error) throw error;
        result = data?.[0];
      }

      toast({
        title: fixture?.id ? "Fixture updated" : "Fixture created",
        description: fixture?.id ? "Your fixture has been updated successfully." : "Your fixture has been created successfully."
      });
      
      if (onSuccess) {
        onSuccess(result || fixtureData);
      }
      
      return result || fixtureData;
    } catch (error) {
      console.error("Error saving fixture:", error);
      toast({
        title: "Error",
        description: "There was an error saving the fixture.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle fixture deletion
  const deleteFixture = async () => {
    if (!fixture?.id) return;
    setIsDeleting(true);
    try {
      // Delete related records first
      await supabase.from("fixture_attendance").delete().eq("fixture_id", fixture.id);
      await supabase.from("team_selections").delete().eq("fixture_id", fixture.id);
      // Then delete the fixture
      const { error } = await supabase.from("fixtures").delete().eq("id", fixture.id);
      if (error) throw error;
      toast({
        title: "Fixture deleted",
        description: "The fixture has been deleted successfully."
      });
      if (onSuccess) {
        onSuccess({
          ...fixture,
          deleted: true
        });
      }
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the fixture.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Make sure players is properly defined before being used
  const { data: players = [] } = useQuery({
    queryKey: ["players-for-fixture"],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").order("name");
      if (error) throw error;
      return data || [];
    }
  });

  // Now players is properly defined and can be used
  const playerMap = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {} as Record<string, any>);

  return {
    form,
    onSubmit,
    isSubmitting,
    isDeleting,
    deleteFixture,
    categories,
    formats,
    players,
    playerMap
  };
};

export { fixtureFormSchema };
