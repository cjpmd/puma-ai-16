import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, isSameMonth, parseISO } from "date-fns";
import { AddSessionDialog } from "@/components/training/AddSessionDialog";
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FixtureCard } from "@/components/calendar/FixtureCard";
import { SessionCard } from "@/components/training/SessionCard";
import { EditObjectiveDialog } from "@/components/calendar/EditObjectiveDialog";
import { Link } from "react-router-dom";
import { AddEventMenu } from "@/components/calendar/AddEventMenu";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ObjectivesList } from "@/components/calendar/ObjectivesList";
import { Fixture } from "@/types/fixture";

export const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [isAddFriendlyOpen, setIsAddFriendlyOpen] = useState(false);
  const [isAddTournamentOpen, setIsAddTournamentOpen] = useState(false);
  const [isAddFestivalOpen, setIsAddFestivalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);
  const [isEditObjectiveOpen, setIsEditObjectiveOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});

  const { toast } = useToast();

  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ["training-sessions", date],
    queryFn: async () => {
      if (!date) return [];
      
      const { data, error } = await supabase
        .from("training_sessions")
        .select(`
          *,
          training_drills (
            *,
            training_files (*)
          )
        `)
        .eq("date", format(date, "yyyy-MM-dd"))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: fixtures, refetch: refetchFixtures } = useQuery({
    queryKey: ["fixtures", date],
    queryFn: async () => {
      if (!date) return [];
      
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("date", format(date, "yyyy-MM-dd"))
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: objectives, refetch: refetchObjectives } = useQuery({
    queryKey: ["objectives", date],
    queryFn: async () => {
      if (!date) return [];
      
      const startDate = startOfMonth(date);
      const endDate = endOfMonth(date);
      
      const { data, error } = await supabase
        .from('player_objectives')
        .select(`
          *,
          players (
            name
          ),
          profiles:coach_id (
            name
          )
        `)
        .gte('review_date', format(startDate, 'yyyy-MM-dd'))
        .lte('review_date', format(endDate, 'yyyy-MM-dd'))
        .order('review_date', { ascending: true });

      if (error) throw error;
      
      return data.filter(objective => 
        objective.review_date && 
        isSameMonth(parseISO(objective.review_date), date)
      );
    },
    enabled: !!date,
  });

  const handleDeleteFixture = async (fixtureId: string) => {
    try {
      const { error } = await supabase
        .from("fixtures")
        .delete()
        .eq("id", fixtureId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fixture deleted successfully",
      });
      refetchFixtures();
    } catch (error) {
      console.error("Error deleting fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete fixture",
      });
    }
  };

  const handleUpdateFixtureDate = async (fixtureId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from("fixtures")
        .update({
          date: format(newDate, "yyyy-MM-dd"),
        })
        .eq("id", fixtureId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fixture date updated successfully",
      });
      refetchFixtures();
    } catch (error) {
      console.error("Error updating fixture date:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update fixture date",
      });
    }
  };

  const handleAddDrill = (sessionId: string) => {
    console.log("Adding drill to session:", sessionId);
  };

  const handleEditDrill = (sessionId: string, drill: any) => {
    console.log("Editing drill:", drill, "in session:", sessionId);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
      refetchSessions();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete session",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex items-center gap-4">
          <AddEventMenu
            isOpen={isAddMenuOpen}
            onOpenChange={setIsAddMenuOpen}
            onAddFixture={() => setIsAddFixtureOpen(true)}
            onAddFriendly={() => setIsAddFriendlyOpen(true)}
            onAddTournament={() => setIsAddTournamentOpen(true)}
            onAddFestival={() => setIsAddFestivalOpen(true)}
          />
          <Link to="/fixtures">
            <Button variant="secondary">
              View Fixtures
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CalendarView
          date={date}
          onDateSelect={(newDate) => newDate && setDate(newDate)}
          sessions={sessions}
          fixtures={fixtures}
        />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {fixtures?.map((fixture) => (
                <FixtureCard 
                  key={fixture.id} 
                  fixture={fixture}
                  onEdit={(fixture) => {
                    setEditingFixture(fixture);
                    setIsAddFixtureOpen(true);
                  }}
                  onDelete={handleDeleteFixture}
                  onDateChange={(newDate) => handleUpdateFixtureDate(fixture.id, newDate)}
                />
              ))}
              {sessions?.map((session) => (
                <SessionCard 
                  key={session.id}
                  session={{
                    id: session.id,
                    title: session.title,
                    drills: session.training_drills.map(drill => ({
                      id: drill.id,
                      title: drill.title,
                      instructions: drill.instructions,
                      training_files: drill.training_files
                    }))
                  }}
                  fileUrls={fileUrls}
                  onAddDrillClick={handleAddDrill}
                  onEditDrillClick={handleEditDrill}
                  onDeleteSession={handleDeleteSession}
                />
              ))}
              {(!sessions?.length && !fixtures?.length) && (
                <div className="text-center py-8 text-muted-foreground">
                  No events scheduled for this date
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <ObjectivesList
          date={date}
          objectives={objectives || []}
          onEditObjective={(objective) => {
            setEditingObjective(objective);
            setIsEditObjectiveOpen(true);
          }}
        />
      </div>

      <Dialog open={isAddFixtureOpen} onOpenChange={setIsAddFixtureOpen}>
        <AddFixtureDialog 
          isOpen={isAddFixtureOpen}
          onOpenChange={setIsAddFixtureOpen}
          selectedDate={date}
          onSuccess={() => {
            refetchFixtures();
            setIsAddFixtureOpen(false);
            setEditingFixture(null);
          }}
          editingFixture={editingFixture}
        />
      </Dialog>

      <Dialog open={isAddFriendlyOpen} onOpenChange={setIsAddFriendlyOpen}>
        <AddFixtureDialog 
          isOpen={isAddFriendlyOpen}
          onOpenChange={setIsAddFriendlyOpen}
          selectedDate={date}
          onSuccess={() => {
            refetchFixtures();
            setIsAddFriendlyOpen(false);
          }}
          showDateSelector
        />
      </Dialog>
    </div>
  );
};