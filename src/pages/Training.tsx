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
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface TrainingSession {
  id: string;
  date: Date;
  title: string;
  description: string;
  drills: Drill[];
}

interface Drill {
  id: string;
  title: string;
  description: string;
}

export const Training = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");

  const handleAddSession = () => {
    if (!date || !newSessionTitle) return;

    const newSession: TrainingSession = {
      id: crypto.randomUUID(),
      date: date,
      title: newSessionTitle,
      description: newSessionDescription,
      drills: [],
    };

    setSessions([...sessions, newSession]);
    setIsAddingSession(false);
    setNewSessionTitle("");
    setNewSessionDescription("");
  };

  const sessionsForSelectedDate = sessions.filter(
    (session) => date && format(session.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );

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
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
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
          {sessionsForSelectedDate.length === 0 ? (
            <p className="text-muted-foreground">No sessions scheduled for this date.</p>
          ) : (
            <div className="space-y-4">
              {sessionsForSelectedDate.map((session) => (
                <Card key={session.id}>
                  <CardHeader>
                    <CardTitle>{session.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{session.description}</p>
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