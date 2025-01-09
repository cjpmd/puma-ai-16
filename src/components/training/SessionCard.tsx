import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DrillCard } from "./DrillCard";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    drills: {
      id: string;
      title: string;
      instructions: string | null;
      training_files: {
        id: string;
        file_name: string;
        file_path: string;
      }[];
    }[];
  };
  fileUrls: Record<string, string>;
  onAddDrillClick: (sessionId: string) => void;
}

export const SessionCard = ({ session, fileUrls, onAddDrillClick }: SessionCardProps) => {
  return (
    <Card key={session.id}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {session.title}
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" onClick={() => onAddDrillClick(session.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Drill
              </Button>
            </DialogTrigger>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session.drills?.length > 0 ? (
          <div className="space-y-4">
            {session.drills.map((drill) => (
              <DrillCard key={drill.id} drill={drill} fileUrls={fileUrls} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No drills added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};