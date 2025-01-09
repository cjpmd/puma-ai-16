import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player, Attribute } from "@/types/player";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AddPlayerDialog } from "@/components/AddPlayerDialog";
import { motion } from "framer-motion";

interface SupabasePlayer {
  id: string;
  name: string;
  age: number;
  squad_number: number;
  player_category: string;
  created_at: string;
  updated_at: string;
  player_attributes: {
    id: string;
    name: string;
    value: number;
    category: string;
    player_id: string;
    created_at: string;
  }[];
}

const SquadManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          player_attributes (*)
        `);

      if (error) throw error;

      // Transform the data to match our Player type
      return (data as SupabasePlayer[]).map((player): Player => ({
        id: player.id,
        name: player.name,
        age: player.age,
        squadNumber: player.squad_number,
        playerCategory: player.player_category as PlayerCategory,
        attributes: player.player_attributes.map((attr): Attribute => ({
          id: attr.id,
          name: attr.name,
          value: attr.value,
          category: attr.category as AttributeCategory,
          player_id: attr.player_id,
          created_at: attr.created_at,
        })),
        created_at: player.created_at,
        updated_at: player.updated_at,
      }));
    },
  });

  const filteredPlayers = selectedCategory
    ? players?.filter((player) => player.playerCategory === selectedCategory)
    : players;

  const calculateAverageAttribute = (player: Player, category: string) => {
    const categoryAttributes = player.attributes.filter(
      (attr) => attr.category === category
    );
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return categoryAttributes.length > 0
      ? (sum / categoryAttributes.length).toFixed(1)
      : "N/A";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">Squad Management</h1>
          </div>
          <AddPlayerDialog />
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All Players
          </Button>
          <Button
            variant={selectedCategory === "RONALDO" ? "default" : "outline"}
            onClick={() => setSelectedCategory("RONALDO")}
          >
            Ronaldo Category
          </Button>
          <Button
            variant={selectedCategory === "MESSI" ? "default" : "outline"}
            onClick={() => setSelectedCategory("MESSI")}
          >
            Messi Category
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading squad data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Squad #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Technical</TableHead>
                <TableHead>Mental</TableHead>
                <TableHead>Physical</TableHead>
                <TableHead>Goalkeeping</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers?.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    {player.squadNumber}
                  </TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>{player.playerCategory}</TableCell>
                  <TableCell>{calculateAverageAttribute(player, "TECHNICAL")}</TableCell>
                  <TableCell>{calculateAverageAttribute(player, "MENTAL")}</TableCell>
                  <TableCell>{calculateAverageAttribute(player, "PHYSICAL")}</TableCell>
                  <TableCell>
                    {calculateAverageAttribute(player, "GOALKEEPING")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
};

export default SquadManagement;