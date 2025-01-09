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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = calculateAge(dateOfBirth);
    
    // Log the data being sent
    console.log('Submitting player data:', {
      name,
      age,
      date_of_birth: dateOfBirth,
      squad_number: parseInt(squadNumber),
      player_category: playerCategory,
    });

    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No authenticated session found');
        toast({
          title: "Error",
          description: "You must be logged in to add players",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .insert({
          name,
          age,
          date_of_birth: dateOfBirth,
          squad_number: parseInt(squadNumber),
          player_category: playerCategory,
        })
        .select();

      // Log the response
      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Player added successfully",
      });

      // Invalidate the players query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['players'] });

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