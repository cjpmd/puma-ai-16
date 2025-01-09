import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

interface AddDrillDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  editDrill?: {
    id: string;
    title: string;
    instructions: string | null;
  };
}

export const AddDrillDialog = ({
  isOpen,
  onOpenChange,
  title,
  onTitleChange,
  instructions,
  onInstructionsChange,
  onFileChange,
  onAdd,
  editDrill,
}: AddDrillDialogProps) => {
  useEffect(() => {
    if (editDrill) {
      onTitleChange(editDrill.title);
      onInstructionsChange(editDrill.instructions || "");
    } else {
      onTitleChange("");
      onInstructionsChange("");
    }
  }, [editDrill, onTitleChange, onInstructionsChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editDrill ? "Edit Training Drill" : "Add Training Drill"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="drillTitle">Drill Title</Label>
            <Input
              id="drillTitle"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
            />
          </div>
          {!editDrill && (
            <div>
              <Label htmlFor="file">Attachment</Label>
              <Input
                id="file"
                type="file"
                onChange={onFileChange}
                className="cursor-pointer"
              />
            </div>
          )}
          <Button onClick={onAdd} className="w-full">
            {editDrill ? "Update Drill" : "Add Drill"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};