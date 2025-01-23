import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format as dateFormat } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddTournamentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onSuccess?: () => void;
}

export const AddTournamentDialog = ({
  isOpen,
  onOpenChange,
  selectedDate,
  onSuccess,
}: AddTournamentDialogProps) => {
  const [date, setDate] = useState(selectedDate ? dateFormat(selectedDate, 'yyyy-MM-dd') : '');
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [gameFormat, setGameFormat] = useState("7-a-side");
  const [numberOfTeams, setNumberOfTeams] = useState("4");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const { error } = await supabase.from("tournaments").insert([{
        date,
        time: time || null,
        location,
        format: gameFormat,
        number_of_teams: parseInt(numberOfTeams),
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tournament added successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving tournament:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add tournament",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tournament</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="time">Time</Label>
            <Input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="format">Format</Label>
            <Select value={gameFormat} onValueChange={setGameFormat}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4-a-side">4-a-side</SelectItem>
                <SelectItem value="5-a-side">5-a-side</SelectItem>
                <SelectItem value="7-a-side">7-a-side</SelectItem>
                <SelectItem value="9-a-side">9-a-side</SelectItem>
                <SelectItem value="11-a-side">11-a-side</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="numberOfTeams">Number of Teams</Label>
            <Select value={numberOfTeams} onValueChange={setNumberOfTeams}>
              <SelectTrigger>
                <SelectValue placeholder="Select number of teams" />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} teams
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTournamentDialog;