import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
  files: DrillFile[];
}

interface DrillFile {
  id: string;
  file_name: string;
  file_path: string;
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

  const getFileUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('training_files')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Training Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Training Sessions for {date ? format(date, "MMMM d, yyyy") : "Selected Date"}
          </CardTitle>
          <Dialog open={isAddingSession} onOpenChange={setIsAddingSession}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Training Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddSession} className="w-full">
                  Add Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading sessions...</p>
          ) : sessions?.length === 0 ? (
            <p className="text-muted-foreground">No sessions scheduled for this date.</p>
          ) : (
            <div className="space-y-4">
              {sessions?.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {session.title}
                      <Dialog open={isAddingDrill && selectedSession === session.id} 
                             onOpenChange={(open) => {
                               setIsAddingDrill(open);
                               if (open) setSelectedSession(session.id);
                             }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Drill
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Training Drill</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="drillTitle">Drill Title</Label>
                              <Input
                                id="drillTitle"
                                value={newDrillTitle}
                                onChange={(e) => setNewDrillTitle(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="instructions">Instructions</Label>
                              <Textarea
                                id="instructions"
                                value={newDrillInstructions}
                                onChange={(e) => setNewDrillInstructions(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="file">Attachment</Label>
                              <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                className="cursor-pointer"
                              />
                            </div>
                            <Button onClick={handleAddDrill} className="w-full">
                              Add Drill
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {session.drills?.length > 0 ? (
                      <div className="space-y-4">
                        {session.drills.map((drill) => (
                          <div key={drill.id} className="border rounded-lg p-4">
                            <h4 className="font-medium">{drill.title}</h4>
                            {drill.instructions && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {drill.instructions}
                              </p>
                            )}
                            {drill.files?.length > 0 && (
                              <div className="mt-2">
                                {drill.files.map((file) => (
                                  <a
                                    key={file.id}
                                    href={getFileUrl(file.file_path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline flex items-center mt-1"
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    {file.file_name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No drills added yet.</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};