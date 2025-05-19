import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Fixture } from "@/types/fixture";
import { generateUUID } from "@/utils/uuid";

// Define the schema for fixture form validation
const fixtureFormSchema = z.object({
  opponent: z.string().min(1, "Opponent name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  location: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  format: z.string().min(1, "Format is required"),
  is_home: z.boolean().default(true),
  notes: z.string().optional(),
  team_id: z.string().optional(),
});

export type FixtureFormValues = z.infer<typeof fixtureFormSchema>;

interface UseFixtureFormProps {
  fixture?: Fixture;
  onSuccess?: (fixture: Fixture) => void;
}

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
    },
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
    },
  });

  // Initialize form with fixture data if provided
  const form = useForm<FixtureFormValues>({
    resolver: zodResolver(fixtureFormSchema),
    defaultValues: fixture
      ? {
          opponent: fixture.opponent || "",
          date: fixture.date || "",
          time: fixture.time || "",
          location: fixture.location || "",
          category: fixture.category || "",
          format: fixture.format || "",
          is_home: fixture.is_home !== undefined ? fixture.is_home : true,
          notes: fixture.notes || "",
          team_id: fixture.team_id || "",
        }
      : {
          opponent: "",
          date: new Date().toISOString().split("T")[0],
          time: "",
          location: "",
          category: "",
          format: "",
          is_home: true,
          notes: "",
          team_id: "",
        },
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
      });
    }
  }, [fixture, form]);

  // Handle form submission
  const onSubmit = async (values: FixtureFormValues) => {
    setIsSubmitting(true);
    try {
      const fixtureData = {
        ...values,
        id: fixture?.id || generateUUID(),
      };

      const { error } = fixture?.id
        ? await supabase
            .from("fixtures")
            .update(fixtureData)
            .eq("id", fixture.id)
        : await supabase.from("fixtures").insert([fixtureData]);

      if (error) throw error;

      toast({
        title: fixture?.id ? "Fixture updated" : "Fixture created",
        description: fixture?.id
          ? "Your fixture has been updated successfully."
          : "Your fixture has been created successfully.",
      });

      if (onSuccess) {
        onSuccess(fixtureData as Fixture);
      }
    } catch (error) {
      console.error("Error saving fixture:", error);
      toast({
        title: "Error",
        description: "There was an error saving the fixture.",
        variant: "destructive",
      });
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
      await supabase
        .from("fixture_attendance")
        .delete()
        .eq("fixture_id", fixture.id);

      await supabase
        .from("team_selections")
        .delete()
        .eq("fixture_id", fixture.id);

      // Then delete the fixture
      const { error } = await supabase
        .from("fixtures")
        .delete()
        .eq("id", fixture.id);

      if (error) throw error;

      toast({
        title: "Fixture deleted",
        description: "The fixture has been deleted successfully.",
      });

      if (onSuccess) {
        onSuccess({ ...fixture, deleted: true } as Fixture);
      }
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the fixture.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Make sure players is properly defined before being used
  const { data: players = [] } = useQuery({
    queryKey: ["players-for-fixture"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data || [];
    }
  });
  
  // Now players is properly defined and can be used
  const playerMap = players.reduce((acc, player) => {
    acc[player.id] = player;
    return acc;
  }, {});

  return {
    form,
    onSubmit,
    isSubmitting,
    isDeleting,
    deleteFixture,
    categories,
    formats,
    players,
    playerMap,
  };
};
