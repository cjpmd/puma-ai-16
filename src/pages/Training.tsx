import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TrainingCalendar } from "@/components/training/TrainingCalendar";
import { AddSessionDialog } from "@/components/training/AddSessionDialog";
import { AddDrillDialog } from "@/components/training/AddDrillDialog";
import { SessionCard } from "@/components/training/SessionCard";

interface TrainingSession {
  id: string;
  date: string;
  title: string;
  drills: Drill[];
}

interface Drill {
  id: string;
  title: string;
  instructions: string | null;
  training_files: DrillFile[];
}

interface DrillFile {
  id: string;
  file_name: string;
  file_path: string;
  url?: string;
}

export const Training = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isAddingDrill, setIsAddingDrill] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newDrillTitle, setNewDrillTitle] = useState("");
  const [newDrillInstructions, setNewDrillInstructions] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["training-sessions", date],
    queryFn: async () => {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("training_sessions")
        .select(`
          id,
          title,
          date,
          training_drills (
            id,
            title,
            instructions,
            training_files (
              id,
              file_name,
              file_path
            )
          )
        `)
        .eq("date", date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));

      if (sessionsError) throw sessionsError;
      return sessionsData.map(session => ({
        ...session,
        drills: session.training_drills || []
      }));
    },
    enabled: !!date
  });

  useEffect(() => {
    const loadFileUrls = async () => {
      const urls: Record<string, string> = {};
      if (sessions) {
        for (const session of sessions) {
          for (const drill of session.drills) {
            for (const file of drill.training_files) {
              const { data } = await supabase.storage
                .from('training_files')
                .getPublicUrl(file.file_path);
              urls[file.file_path] = data.publicUrl;
            }
          }
        }
      }
      setFileUrls(urls);
    };
    loadFileUrls();
  }, [sessions]);

  const addSessionMutation = useMutation({
    mutationFn: async () => {
      if (!date || !newSessionTitle) return;

      const { data, error } = await supabase
        .from("training_sessions")
        .insert({
          date: format(date, "yyyy-MM-dd"),
          title: newSessionTitle,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
      setIsAddingSession(false);
      setNewSessionTitle("");
      toast({
        title: "Success",
        description: "Training session added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add training session",
        variant: "destructive",
      });
      console.error("Error adding session:", error);
    },
  });

  const addDrillMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSession || !newDrillTitle) return;

      const { data: drill, error: drillError } = await supabase
        .from("training_drills")
        .insert({
          session_id: selectedSession,
          title: newDrillTitle,
          instructions: newDrillInstructions,
        })
        .select()
        .single();

      if (drillError) throw drillError;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('training_files')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { error: fileError } = await supabase
          .from("training_files")
          .insert({
            drill_id: drill.id,
            file_name: selectedFile.name,
            file_path: filePath,
            content_type: selectedFile.type,
          });

        if (fileError) throw fileError;
      }

      return drill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-sessions"] });
      setIsAddingDrill(false);
      setNewDrillTitle("");
      setNewDrillInstructions("");
      setSelectedFile(null);
      toast({
        title: "Success",
        description: "Drill added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add drill",
        variant: "destructive",
      });
      console.error("Error adding drill:", error);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddSession = () => {
    addSessionMutation.mutate();
  };

  const handleAddDrill = () => {
    addDrillMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <TrainingCalendar date={date} onDateSelect={setDate} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Training Sessions for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}
          </CardTitle>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setIsAddingSession(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Session
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading sessions...</p>
          ) : sessions?.length === 0 ? (
            <p className="text-muted-foreground">No sessions scheduled for this date.</p>
          ) : (
            <div className="space-y-4">
              {sessions?.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  fileUrls={fileUrls}
                  onAddDrillClick={(sessionId) => {
                    setSelectedSession(sessionId);
                    setIsAddingDrill(true);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddSessionDialog
        isOpen={isAddingSession}
        onOpenChange={setIsAddingSession}
        title={newSessionTitle}
        onTitleChange={setNewSessionTitle}
        onAdd={handleAddSession}
      />

      <AddDrillDialog
        isOpen={isAddingDrill}
        onOpenChange={(open) => {
          setIsAddingDrill(open);
          if (!open) setSelectedSession(null);
        }}
        title={newDrillTitle}
        onTitleChange={setNewDrillTitle}
        instructions={newDrillInstructions}
        onInstructionsChange={setNewDrillInstructions}
        onFileChange={handleFileChange}
        onAdd={handleAddDrill}
      />
    </div>
  );
};