import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { AddSessionDialog } from "@/components/training/AddSessionDialog";
import { AddDrillDialog } from "@/components/training/AddDrillDialog";
import { SessionCard } from "@/components/training/SessionCard";
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FixtureCard } from "@/components/calendar/FixtureCard";

interface TrainingFile {
  id: string;
  file_name: string;
  file_path: string;
}

interface TrainingDrill {
  id: string;
  title: string;
  instructions: string | null;
  training_files: TrainingFile[];
}

interface TrainingSession {
  id: string;
  title: string;
  date: string;
  training_drills: TrainingDrill[];
}

export const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
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
  } | null>(null);

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

      return data as TrainingSession[];
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

  const getDayClassNames = (day: Date): string => {
    const dateStr = format(day, "yyyy-MM-dd");
    const hasTraining = sessions?.some(session => session.date === dateStr);
    const hasFixture = fixtures?.some(fixture => fixture.date === dateStr);
    
    let className = "relative";
    
    if (hasTraining && hasFixture) {
      className += " bg-gradient-to-br from-blue-100 to-orange-100";
    } else if (hasTraining) {
      className += " bg-blue-100";
    } else if (hasFixture) {
      className += " bg-orange-100";
    }
    
    return className;
  };

  const handleAddSession = async () => {
    if (!date || !sessionTitle) return;

    const { error } = await supabase
      .from("training_sessions")
      .insert([
        {
          title: sessionTitle,
          date: format(date, "yyyy-MM-dd"),
        },
      ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create training session",
      });
      return;
    }

    setSessionTitle("");
    setIsAddSessionOpen(false);
    refetchSessions();
    toast({
      title: "Success",
      description: "Training session created successfully",
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from("training_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete training session",
      });
      return;
    }

    refetchSessions();
    toast({
      title: "Success",
      description: "Training session deleted successfully",
    });
  };

  const handleDeleteFixture = async (fixtureId: string) => {
    const { error } = await supabase
      .from("fixtures")
      .delete()
      .eq("id", fixtureId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete fixture",
      });
      return;
    }

    refetchFixtures();
    toast({
      title: "Success",
      description: "Fixture deleted successfully",
    });
  };

  const handleEditDrill = async () => {
    if (!selectedSessionId || !drillTitle) return;

    const { error } = await supabase
      .from("training_drills")
      .update({
        title: drillTitle,
        instructions: drillInstructions,
      })
      .eq('id', editingDrill?.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update drill",
      });
      return;
    }

    setDrillTitle("");
    setDrillInstructions("");
    setEditingDrill(null);
    setIsAddDrillOpen(false);
    refetchSessions();
    toast({
      title: "Success",
      description: "Drill updated successfully",
    });
  };

  const handleAddDrill = async () => {
    if (!selectedSessionId || !drillTitle) return;

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

    if (drillError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create drill",
      });
      return;
    }

    if (drill && selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${drill.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('training_files')
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to upload file",
        });
        return;
      }

      const { error: fileError } = await supabase
        .from("training_files")
        .insert([
          {
            drill_id: drill.id,
            file_name: selectedFile.name,
            file_path: filePath,
          },
        ]);

      if (fileError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save file information",
        });
        return;
      }
    }

    setDrillTitle("");
    setDrillInstructions("");
    setSelectedFile(null);
    setIsAddDrillOpen(false);
    refetchSessions();
    toast({
      title: "Success",
      description: "Drill created successfully",
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

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
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                weekStartsOn={1}
                modifiers={{
                  customStyles: (date) => true,
                }}
                modifiersStyles={{
                  customStyles: {
                    position: 'relative',
                  },
                }}
                modifiersClassNames={{
                  customStyles: getDayClassNames(new Date()),
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
                  onTeamSelection={(fixture) => {
                    console.log("Team selection for fixture:", fixture);
                  }}
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
                      instructions: drill.instructions || "",
                      training_files: drill.training_files
                    }))
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
