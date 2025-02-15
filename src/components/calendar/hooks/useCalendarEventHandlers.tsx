
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const useCalendarEventHandlers = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

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
      const { error } = await supabase
        .from("fixtures")
        .update({ date: format(newDate, "yyyy-MM-dd") })
        .eq("id", fixtureId);

      if (error) throw error;

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

  const handleUpdateFestivalDate = async (festivalId: string, newDate: Date) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("festivals")
        .update({ date: format(newDate, "yyyy-MM-dd") })
        .eq("id", festivalId);

      if (error) throw error;

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
    isLoading,
  };
};
