import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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

interface AddFixtureDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingFixture?: any;
  onSuccess?: () => void;
  showDateSelector?: boolean;
  selectedDate?: Date;
}

export const AddFixtureDialog = ({
  isOpen,
  onOpenChange,
  editingFixture,
  onSuccess,
  showDateSelector = true,
  selectedDate,
}: AddFixtureDialogProps) => {
  const [date, setDate] = useState(editingFixture?.date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''));
  const [time, setTime] = useState(editingFixture?.time || "");
  const [opponent, setOpponent] = useState(editingFixture?.opponent || "");
  const [location, setLocation] = useState(editingFixture?.location || "");
  const [category, setCategory] = useState(editingFixture?.category || "Ronaldo");
  const [gameFormat, setGameFormat] = useState(editingFixture?.format || "");
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch default format from team settings
  useEffect(() => {
    const fetchDefaultFormat = async () => {
      const { data, error } = await supabase
        .from("team_settings")
        .select("format")
        .single();

      if (!error && data) {
        setGameFormat(editingFixture?.format || data.format);
      }
    };

    fetchDefaultFormat();
  }, [editingFixture]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const fixtureData = {
        date,
        time: time || null, // Convert empty string to null
        opponent,
        location,
        category,
        format: gameFormat,
      };

      if (editingFixture) {
        const { error } = await supabase
          .from("fixtures")
          .update(fixtureData)
          .eq("id", editingFixture.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("fixtures").insert([fixtureData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Fixture ${editingFixture ? "updated" : "added"} successfully`,
      });

      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving fixture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editingFixture ? "update" : "add"} fixture`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingFixture ? "Edit Fixture" : "Add Fixture"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {showDateSelector && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

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
            <Label htmlFor="opponent">Opponent</Label>
            <Input
              type="text"
              id="opponent"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
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
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ronaldo">Ronaldo</SelectItem>
                <SelectItem value="Messi">Messi</SelectItem>
                <SelectItem value="Jags">Jags</SelectItem>
              </SelectContent>
            </Select>
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

export default AddFixtureDialog;