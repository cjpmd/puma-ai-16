
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export const useCalendarEventHandlers = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDeleteFixture = async (fixtureId: string) => {
    try {
      setIsLoading(true);
      
      // First delete related records
      await supabase
        .from("fixture_team_times")
        .delete()
        .eq("fixture_id", fixtureId);

      await supabase
        .from("fixture_team_scores")
        .delete()
        .eq("fixture_id", fixtureId);

      await supabase
        .from("event_attendance")
        .delete()
        .eq("event_id", fixtureId)
        .eq("event_type", "FIXTURE");

      // Finally delete the fixture
      const { error } = await supabase
        .from("fixtures")
        .delete()
        .eq("id", fixtureId);

      if (error) throw error;

      // Immediately invalidate and refetch fixtures queries
      await queryClient.invalidateQueries({ 
        queryKey: ["fixtures"] 
      });
      
      toast({
        title: "Success",
        description: "Fixture deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete fixture",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFixtureDate = async (fixtureId: string, newDate: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = format(newDate, "yyyy-MM-dd");
      
      const { error } = await supabase
        .from("fixtures")
        .update({ date: formattedDate })
        .eq("id", fixtureId);

      if (error) throw error;

      // Immediately invalidate fixture queries for both the old and new dates
      await queryClient.invalidateQueries({ 
        queryKey: ["fixtures"] 
      });

      toast({
        title: "Success",
        description: "Fixture date updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating fixture date:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update fixture date",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      // Immediately invalidate session queries
      await queryClient.invalidateQueries({ 
        queryKey: ["training-sessions"] 
      });

      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete session",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTournament = async (tournamentId: string) => {
    try {
      setIsLoading(true);
      
      // First delete related records
      await supabase
        .from("event_attendance")
        .delete()
        .eq("event_id", tournamentId)
        .eq("event_type", "TOURNAMENT");

      // Delete the tournament
      const { error } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", tournamentId);

      if (error) throw error;

      // Immediately invalidate tournament queries
      await queryClient.invalidateQueries({ 
        queryKey: ["tournaments"] 
      });

      toast({
        title: "Success",
        description: "Tournament deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting tournament:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete tournament",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTournamentDate = async (tournamentId: string, newDate: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = format(newDate, "yyyy-MM-dd");
      
      const { error } = await supabase
        .from("tournaments")
        .update({ date: formattedDate })
        .eq("id", tournamentId);

      if (error) throw error;

      // Immediately invalidate tournament queries
      await queryClient.invalidateQueries({ 
        queryKey: ["tournaments"] 
      });

      toast({
        title: "Success",
        description: "Tournament date updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating tournament date:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update tournament date",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFestival = async (festivalId: string) => {
    try {
      setIsLoading(true);
      
      // First delete related records
      await supabase
        .from("event_attendance")
        .delete()
        .eq("event_id", festivalId)
        .eq("event_type", "FESTIVAL");

      // Delete the festival
      const { error } = await supabase
        .from("festivals")
        .delete()
        .eq("id", festivalId);

      if (error) throw error;

      // Immediately invalidate festival queries
      await queryClient.invalidateQueries({ 
        queryKey: ["festivals"] 
      });

      toast({
        title: "Success",
        description: "Festival deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting festival:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete festival",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFestivalDate = async (festivalId: string, newDate: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = format(newDate, "yyyy-MM-dd");
      
      const { error } = await supabase
        .from("festivals")
        .update({ date: formattedDate })
        .eq("id", festivalId);

      if (error) throw error;

      // Immediately invalidate festival queries
      await queryClient.invalidateQueries({ 
        queryKey: ["festivals"] 
      });

      toast({
        title: "Success",
        description: "Festival date updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating festival date:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update festival date",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleDeleteFixture,
    handleUpdateFixtureDate,
    handleDeleteSession,
    handleUpdateFestivalDate,
    handleDeleteFestival,
    handleDeleteTournament,
    handleUpdateTournamentDate,
    isLoading,
  };
};
