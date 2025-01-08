import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlayersStore } from "@/store/players";
import { Plus } from "lucide-react";
import { PlayerCategory } from "@/types/player";

export const AddPlayerDialog = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [squadNumber, setSquadNumber] = useState("");
  const [playerCategory, setPlayerCategory] = useState<PlayerCategory>("MESSI");
  const addPlayer = usePlayersStore((state) => state.addPlayer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlayer({
      name,
      age: parseInt(age),
      squadNumber: parseInt(squadNumber),
      playerCategory,
    });
    setOpen(false);
    setName("");
    setAge("");
    setSquadNumber("");
    setPlayerCategory("MESSI");
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
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="0"
              value={age}
              onChange={(e) => setAge(e.target.value)}
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