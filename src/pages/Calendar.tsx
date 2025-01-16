import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, isSameMonth, isSameDay, parseISO } from "date-fns";
import { AddSessionDialog } from "@/components/training/AddSessionDialog";
import { AddDrillDialog } from "@/components/training/AddDrillDialog";
import { SessionCard } from "@/components/training/SessionCard";
import { AddFixtureDialog } from "@/components/calendar/AddFixtureDialog";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { FixtureCard } from "@/components/calendar/FixtureCard";
import { Badge } from "@/components/ui/badge";

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
    date: string;
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

  const getDayClassNames = (day: Date): string => {
    if (!date || !isSameMonth(day, date)) {
      return "relative";
    }
    
    const dateStr = format(day, "yyyy-MM-dd");
    const hasTraining = sessions?.some(session => session.date === dateStr);
    const hasFixture = fixtures?.some(fixture => fixture.date === dateStr);
    
    let className = "relative";
    
    if (hasTraining && hasFixture) {
      className += " before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-100 before:to-orange-100 before:rounded-md before:-z-10";
    } else if (hasTraining) {
      className += " before:absolute before:inset-0 before:bg-blue-100 before:rounded-md before:-z-10";
    } else if (hasFixture) {
      className += " before:absolute before:inset-0 before:bg-orange-100 before:rounded-md before:-z-10";
    }
    
    return className;
  };

  const handleUpdateFixtureDate = async (fixtureId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from("fixtures")
        .update({ date: format(newDate, "yyyy-MM-dd") })
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
                  customStyles: (date) => getDayClassNames(date),
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

      {/* New Objectives Dashboard */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            Objectives for Review in {date ? format(date, 'MMMM yyyy') : 'Selected Month'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {objectives?.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No objectives scheduled for review this month
              </p>
            )}
            {objectives?.map((objective) => (
              <div key={objective.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{objective.title}</h4>
                      <Badge variant={
                        objective.status === 'COMPLETE' ? 'default' :
                        objective.status === 'IMPROVING' ? 'secondary' :
                        'outline'
                      }>
                        {objective.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{objective.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Player: {objective.players?.name}</span>
                      <span>•</span>
                      <span>Coach: {objective.profiles?.name}</span>
                      <span>•</span>
                      <span>Review on: {format(new Date(objective.review_date), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{objective.points} points</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
