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

  const handleAddSession = async () => {
    if (!date || !sessionTitle) return;

    await supabase
      .from("training_sessions")
      .insert([
        {
          title: sessionTitle,
          date: format(date, "yyyy-MM-dd"),
        },
      ]);

    setSessionTitle("");
    setIsAddSessionOpen(false);
    refetchSessions();
  };

  const handleAddDrill = async () => {
    if (!selectedSessionId || !drillTitle) return;

    const { data: drill } = await supabase
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

    if (drill && selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${drill.id}/${Math.random()}.${fileExt}`;

      await supabase.storage
        .from('training_files')
        .upload(filePath, selectedFile);

      await supabase
        .from("training_files")
        .insert([
          {
            drill_id: drill.id,
            file_name: selectedFile.name,
            file_path: filePath,
          },
        ]);
    }

    setDrillTitle("");
    setDrillInstructions("");
    setSelectedFile(null);
    setIsAddDrillOpen(false);
    refetchSessions();
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
              open={isAddFixtureOpen}
              onOpenChange={setIsAddFixtureOpen}
              selectedDate={date}
              onSuccess={() => {
                refetchFixtures();
                setIsAddFixtureOpen(false);
              }}
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
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
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
                <Card key={fixture.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Fixture vs {fixture.opponent}</h3>
                    <div className="text-lg">
                      {fixture.home_score !== null && fixture.away_score !== null ? (
                        <span>
                          {fixture.home_score} - {fixture.away_score}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Score pending</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {sessions?.map((session) => (
                <SessionCard 
                  key={session.id} 
                  session={session}
                  fileUrls={{}}
                  onAddDrillClick={(sessionId) => {
                    setSelectedSessionId(sessionId);
                    setIsAddDrillOpen(true);
                  }}
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
        onAdd={handleAddDrill}
      />
    </div>
  );
};