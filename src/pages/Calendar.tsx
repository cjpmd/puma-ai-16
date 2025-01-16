import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { AddSessionDialog } from "@/components/training/AddSessionDialog";
import { AddDrillDialog } from "@/components/training/AddDrillDialog";
import { SessionCard } from "@/components/training/SessionCard";
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FixtureCard } from "@/components/calendar/FixtureCard";

interface DbTrainingSession {
  id: string;
  title: string;
  date: string;
  created_at: string;
  updated_at: string;
  training_drills: {
    id: string;
    title: string;
    instructions: string;
    session_id: string;
    created_at: string;
    updated_at: string;
    training_files: Array<{
      id: string;
      file_name: string;
      file_path: string;
    }>;
  }[];
}

// Component types
interface TrainingSession {
  id: string;
  title: string;
  date: string;
  drills: {
    id: string;
    title: string;
    instructions: string;
    training_files: Array<{
      id: string;
      file_name: string;
      file_path: string;
    }>;
  }[];
}

export const CalendarPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isAddDrillOpen, setIsAddDrillOpen] = useState(false);
  const [drillTitle, setDrillTitle] = useState("");
  const [drillInstructions, setDrillInstructions] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingDrill, setEditingDrill] = useState<{
    id: string;
    title: string;
    instructions: string | null;
  } | null>(null);
  const [editingFixture, setEditingFixture] = useState<{
    id: string;
    opponent: string;
    home_score: number | null;
    away_score: number | null;
    date: string;
  } | null>(null);

  const { toast } = useToast();

  const handleAddSession = async () => {
    try {
      if (!date) return;
      
      const { error } = await supabase
        .from("training_sessions")
        .insert([
          {
            title: sessionTitle,
            date: format(date, "yyyy-MM-dd"),
          },
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training session added successfully",
      });
      setIsAddSessionOpen(false);
      setSessionTitle("");
      refetchSessions();
    } catch (error) {
      console.error("Error adding training session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add training session",
      });
    }
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
        description: "Training session deleted successfully",
      });
      refetchSessions();
    } catch (error) {
      console.error("Error deleting training session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete training session",
      });
    }
  };

  const handleAddDrill = async () => {
    try {
      if (!selectedSessionId) return;

      const { data: drill, error: drillError } = await supabase
        .from("training_drills")
        .insert([
          {
            session_id: selectedSessionId,
            title: drillTitle,
            instructions: drillInstructions,
          },
        ])
        .select()
        .single();

      if (drillError) throw drillError;

      if (selectedFile && drill) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${drill.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('training_files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { error: fileError } = await supabase
          .from('training_files')
          .insert([
            {
              drill_id: drill.id,
              file_name: selectedFile.name,
              file_path: filePath,
              content_type: selectedFile.type,
            },
          ]);

        if (fileError) throw fileError;
      }

      toast({
        title: "Success",
        description: "Drill added successfully",
      });
      setIsAddDrillOpen(false);
      setDrillTitle("");
      setDrillInstructions("");
      setSelectedFile(null);
      refetchSessions();
    } catch (error) {
      console.error("Error adding drill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add drill",
      });
    }
  };

  const handleEditDrill = async () => {
    try {
      if (!editingDrill) return;

      const { error } = await supabase
        .from("training_drills")
        .update({
          title: drillTitle,
          instructions: drillInstructions,
        })
        .eq("id", editingDrill.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Drill updated successfully",
      });
      setIsAddDrillOpen(false);
      setDrillTitle("");
      setDrillInstructions("");
      setEditingDrill(null);
      refetchSessions();
    } catch (error) {
      console.error("Error updating drill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update drill",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

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

      // Map database response to component interface
      return (data as DbTrainingSession[]).map(session => ({
        id: session.id,
        title: session.title,
        date: session.date,
        drills: session.training_drills.map(drill => ({
          id: drill.id,
          title: drill.title,
          instructions: drill.instructions,
          training_files: drill.training_files
        }))
      })) as TrainingSession[];
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

  const { data: objectives } = useQuery({
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
      return data;
    },
    enabled: !!date,
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="space-x-4">
          <Dialog open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Training
              </Button>
            </DialogTrigger>
            <AddSessionDialog
              isOpen={isAddSessionOpen}
              onOpenChange={setIsAddSessionOpen}
              title={sessionTitle}
              onTitleChange={setSessionTitle}
              onAdd={handleAddSession}
            />
          </Dialog>
          <Dialog open={isAddFixtureOpen} onOpenChange={setIsAddFixtureOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Fixture
              </Button>
            </DialogTrigger>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded bg-blue-100"></div>
                <span>Training</span>
                <div className="w-3 h-3 rounded bg-orange-100 ml-4"></div>
                <span>Fixture</span>
              </div>
              <Calendar
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
                weekStartsOn={1}
                modifiers={{
                  hasEvent: (day) => {
                    const dateStr = format(day, "yyyy-MM-dd");
                    return (
                      sessions?.some(session => session.date === dateStr) ||
                      fixtures?.some(fixture => fixture.date === dateStr)
                    );
                  }
                }}
                modifiersClassNames={{
                  hasEvent: "relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-100 before:to-orange-100 before:rounded-md before:-z-10"
                }}
              />
            </div>
          </CardContent>
        </Card>

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
                    drills: session.drills
                  }}
                  fileUrls={{}}
                  onAddDrillClick={(sessionId) => {
                    setSelectedSessionId(sessionId);
                    setIsAddDrillOpen(true);
                  }}
                  onEditDrillClick={(sessionId, drill) => {
                    setSelectedSessionId(sessionId);
                    setEditingDrill(drill);
                    setDrillTitle(drill.title);
                    setDrillInstructions(drill.instructions || "");
                    setIsAddDrillOpen(true);
                  }}
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

        {/* Objectives Section */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Objectives for {date ? format(date, 'MMMM yyyy') : 'Selected Month'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {objectives?.map((objective) => (
                <div key={objective.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{objective.title}</h4>
                      <p className="text-sm text-muted-foreground">{objective.description}</p>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span>Player: {objective.players?.name}</span>
                        <span className="mx-2">•</span>
                        <span>Coach: {objective.profiles?.name}</span>
                        <span className="mx-2">•</span>
                        <span>Review: {format(new Date(objective.review_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        objective.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
                        objective.status === 'IMPROVING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {objective.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {objectives?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No objectives scheduled for review this month
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddDrillDialog
        isOpen={isAddDrillOpen}
        onOpenChange={setIsAddDrillOpen}
        title={drillTitle}
        onTitleChange={setDrillTitle}
        instructions={drillInstructions}
        onInstructionsChange={setDrillInstructions}
        onFileChange={handleFileChange}
        onAdd={editingDrill ? handleEditDrill : handleAddDrill}
        editDrill={editingDrill}
      />
    </div>
  );
};
