import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { usePlayerObjectives } from "@/hooks/usePlayerObjectives";
import { ObjectiveForm } from "./ObjectiveForm";
import { ObjectivesList } from "./ObjectivesList";

interface PlayerObjectivesProps {
  playerId: string;
}

export const PlayerObjectives = ({ playerId }: PlayerObjectivesProps) => {
  const [deleteObjectiveId, setDeleteObjectiveId] = useState<string | null>(null);
  const { toast } = useToast();
  const { objectives, profile, refetch } = usePlayerObjectives(playerId);

  const handleDeleteObjective = async () => {
    if (!deleteObjectiveId) return;

    try {
      const { error } = await supabase
        .from('player_objectives')
        .delete()
        .eq('id', deleteObjectiveId);

      if (error) throw error;

      refetch();
      setDeleteObjectiveId(null);
      
      toast({
        title: "Success",
        description: "Objective deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting objective:', error);
      toast({
        title: "Error",
        description: "Failed to delete objective.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Objectives</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ObjectiveForm 
            playerId={playerId} 
            profileId={profile?.id} 
            onSuccess={refetch}
          />

          <ObjectivesList
            objectives={objectives || []}
            onEdit={() => refetch()}
            onDelete={(id) => setDeleteObjectiveId(id)}
            onStatusChange={(objective) => {
              setEditingObjective(objective);
            }}
          />
        </div>
      </CardContent>

      <AlertDialog open={!!deleteObjectiveId} onOpenChange={() => setDeleteObjectiveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the objective.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteObjective}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};