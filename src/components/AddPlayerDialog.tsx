import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { PlayerCategory } from "@/types/player";
import { differenceInYears } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const INITIAL_ATTRIBUTES = {
  GOALKEEPING: [
    "Aerial Reach", "Command of Area", "Communication", "Eccentricity", 
    "Handling", "Kicking", "One on Ones", "Punching", "Reflexes", 
    "Rushing Out", "Throwing"
  ],
  TECHNICAL: [
    "Corners", "Crossing", "Dribbling", "Finishing", "First Touch",
    "Free Kicks", "Heading", "Long Shots", "Long Throws", "Marking",
    "Passing", "Penalties", "Tackling", "Technique"
  ],
  MENTAL: [
    "Aggression", "Anticipation", "Bravery", "Composure", "Concentration",
    "Decisions", "Determination", "Flair", "Leadership", "Off the Ball",
    "Positioning", "Teamwork", "Vision", "Work Rate"
  ],
  PHYSICAL: [
    "Acceleration", "Agility", "Balance", "Jumping", "Natural Fitness",
    "Pace", "Stamina", "Strength"
  ]
};

export const AddPlayerDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [squadNumber, setSquadNumber] = useState("");
  const [playerCategory, setPlayerCategory] = useState<PlayerCategory>("MESSI");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    return differenceInYears(new Date(), birthDate);
  };

  const createInitialAttributes = async (playerId: string) => {
    const attributesToInsert = Object.entries(INITIAL_ATTRIBUTES).flatMap(
      ([category, attributes]) =>
        attributes.map((name) => ({
          player_id: playerId,
          name,
          value: 10, // Default starting value
          category,
        }))
    );

    const { error } = await supabase
      .from('player_attributes')
      .insert(attributesToInsert);

    if (error) throw error;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(dateOfBirth);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to add players",
          variant: "destructive",
        });
        return;
      }

      // Create the player first
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          name,
          age,
          date_of_birth: dateOfBirth,
          squad_number: parseInt(squadNumber),
          player_category: playerCategory,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Create initial attributes for the player
      await createInitialAttributes(playerData.id);

      toast({
        title: "Success",
        description: "Player and attributes added successfully",
      });

      // Invalidate both players and attributes queries
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['attribute-history'] });

      setOpen(false);
      setName("");
      setDateOfBirth("");
      setSquadNumber("");
      setPlayerCategory("MESSI");
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error",
        description: "Failed to add player. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="squadNumber">Squad Number</Label>
            <Input
              id="squadNumber"
              type="number"
              min="1"
              value={squadNumber}
              onChange={(e) => setSquadNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={playerCategory}
              onValueChange={(value: PlayerCategory) => setPlayerCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MESSI">Messi</SelectItem>
                <SelectItem value="RONALDO">Ronaldo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">Add Player</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};