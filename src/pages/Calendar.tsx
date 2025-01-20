import { useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { EventsList } from "@/components/calendar/EventsList";
import { EditObjectiveDialog } from "@/components/calendar/EditObjectiveDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Calendar = () => {
  const [date, setDate] = useState(new Date());
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [isAddTournamentOpen, setIsAddTournamentOpen] = useState(false);
  const [isAddFestivalOpen, setIsAddFestivalOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [editingFixture, setEditingFixture] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<any>(null);

  const { data: sessions } = useQuery({
    queryKey: ["training-sessions", date],
    queryFn: async () => {
      const { data } = await supabase
        .from("training_sessions")
        .select("*")
        .eq("date", date.toISOString().split("T")[0]);
      return data || [];
    },
  });

  const { data: fixtures } = useQuery({
    queryKey: ["fixtures", date],
    queryFn: async () => {
      const { data } = await supabase
        .from("fixtures")
        .select("*")
        .eq("date", date.toISOString().split("T")[0]);
      return data || [];
    },
  });

  const handleAddSession = async () => {
    try {
      const { error } = await supabase.from("training_sessions").insert([
        {
          title: sessionTitle,
          date: date.toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;
      setIsAddSessionOpen(false);
      setSessionTitle("");
    } catch (error) {
      console.error("Error adding session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleDeleteFixture = async (fixtureId: string) => {
    try {
      const { error } = await supabase
        .from("fixtures")
        .delete()
        .eq("id", fixtureId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting fixture:", error);
    }
  };

  const handleUpdateFixtureDate = async (fixtureId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from("fixtures")
        .update({ date: newDate.toISOString().split("T")[0] })
        .eq("id", fixtureId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating fixture date:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <CalendarHeader
        isAddSessionOpen={isAddSessionOpen}
        setIsAddSessionOpen={setIsAddSessionOpen}
        isAddFixtureOpen={isAddFixtureOpen}
        setIsAddFixtureOpen={setIsAddFixtureOpen}
        isAddTournamentOpen={isAddTournamentOpen}
        setIsAddTournamentOpen={setIsAddTournamentOpen}
        isAddFestivalOpen={isAddFestivalOpen}
        setIsAddFestivalOpen={setIsAddFestivalOpen}
        sessionTitle={sessionTitle}
        setSessionTitle={setSessionTitle}
        handleAddSession={handleAddSession}
        setEditingFixture={setEditingFixture}
      />
      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <CalendarGrid
          date={date}
          setDate={setDate}
          sessions={sessions}
          fixtures={fixtures}
        />
        <EventsList
          date={date}
          sessions={sessions}
          fixtures={fixtures}
          onDeleteSession={handleDeleteSession}
          onEditFixture={setEditingFixture}
          onDeleteFixture={handleDeleteFixture}
          onUpdateFixtureDate={handleUpdateFixtureDate}
        />
      </div>
      {selectedObjective && (
        <EditObjectiveDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          objective={selectedObjective}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            setSelectedObjective(null);
          }}
        />
      )}
    </div>
  );
};