import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { EditObjectiveDialog } from "../calendar/EditObjectiveDialog";
import { useState } from "react";

interface ObjectivesListProps {
  objectives: any[];
  onEdit: (objective: any) => void;
  onDelete: (id: string) => void;
  onStatusChange: (objective: any) => void;
}

export const ObjectivesList = ({ objectives, onEdit, onDelete, onStatusChange }: ObjectivesListProps) => {
  const [editingObjective, setEditingObjective] = useState<any>(null);

  return (
    <ScrollArea className="h-[400px] w-full rounded-md">
      <div className="space-y-4 pr-4">
        {objectives?.map((objective) => (
          <div 
            key={objective.id} 
            className="p-4 border rounded-lg space-y-2 cursor-pointer hover:bg-accent/5"
            onClick={() => setEditingObjective(objective)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{objective.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{objective.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Added by {objective.profiles?.name || 'Anonymous Coach'}</span>
                  <span>•</span>
                  <span>Created: {format(new Date(objective.created_at), 'MMM d, yyyy')}</span>
                  {objective.review_date && (
                    <>
                      <span>•</span>
                      <span>Review on: {format(new Date(objective.review_date), 'MMM d, yyyy')}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{objective.points} points</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(objective.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
              <Select
                value={objective.status}
                onValueChange={(value) => {
                  const updatedObjective = { ...objective, status: value };
                  onStatusChange(updatedObjective);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                  <SelectItem value="IMPROVING">Improving</SelectItem>
                  <SelectItem value="COMPLETE">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {editingObjective && (
        <EditObjectiveDialog
          objective={editingObjective}
          isOpen={!!editingObjective}
          onOpenChange={(open) => !open && setEditingObjective(null)}
          onSuccess={() => {
            setEditingObjective(null);
            onEdit(editingObjective);
          }}
        />
      )}
    </ScrollArea>
  );
};