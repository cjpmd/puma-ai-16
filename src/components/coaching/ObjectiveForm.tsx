import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ObjectiveFormProps {
  playerId: string;
  profileId: string | undefined;
  onSuccess: () => void;
}

export const ObjectiveForm = ({ playerId, profileId, onSuccess }: ObjectiveFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState("5");
  const [reviewDate, setReviewDate] = useState<Date>();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAddObjective = async () => {
    setIsSaving(true);
    if (!profileId) {
      toast({
        title: "Error",
        description: "You must be logged in to add objectives.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    if (!reviewDate) {
      toast({
        title: "Error",
        description: "Please select a review date.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('player_objectives')
        .insert([
          {
            player_id: playerId,
            coach_id: profileId,
            title,
            description,
            points: parseInt(points),
            status: 'ONGOING',
            review_date: format(reviewDate, 'yyyy-MM-dd')
          }
        ]);

      if (error) throw error;

      setTimeout(() => {
        setTitle("");
        setDescription("");
        setPoints("5");
        setReviewDate(undefined);
        setIsSaving(false);
        onSuccess();
      }, 1000);
      
      toast({
        title: "Success",
        description: "New objective has been added successfully.",
      });
    } catch (error) {
      console.error('Error adding objective:', error);
      toast({
        title: "Error",
        description: "Failed to add objective. Please try again.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Objective title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Objective description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Points"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        min="1"
        max="20"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !reviewDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {reviewDate ? format(reviewDate, "PPP") : <span>Pick a review date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={reviewDate}
            onSelect={setReviewDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Button 
        onClick={handleAddObjective} 
        disabled={!title.trim() || !profileId || !reviewDate || isSaving}
        className={`transition-all ${isSaving ? 'bg-green-500 hover:bg-green-600' : ''}`}
      >
        {isSaving ? (
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Saved!
          </span>
        ) : (
          'Add Objective'
        )}
      </Button>
    </div>
  );
};