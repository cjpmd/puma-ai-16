import { useState } from "react";
import { usePlayersStore } from "@/store/players";
import { PlayerCard } from "@/components/PlayerCard";
import { AddPlayerDialog } from "@/components/AddPlayerDialog";
import { PlayerDetails } from "@/components/PlayerDetails";
import { Player } from "@/types/player";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, BarChart2, UserCircle } from "lucide-react";

const Index = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const players = usePlayersStore((state) => state.players);

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Player Overview</h1>
          <div className="flex items-center gap-4">
            <Link to="/squad">
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Squad
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline">
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link to="/coaches">
              <Button variant="outline">
                <UserCircle className="mr-2 h-4 w-4" />
                Coaches
              </Button>
            </Link>
            <AddPlayerDialog />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Players</h2>
            <div className="grid gap-4">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onSelect={setSelectedPlayer}
                />
              ))}
              {players.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No players added yet. Click "Add Player" to get started.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Player Details</h2>
            {selectedPlayer ? (
              <PlayerDetails player={selectedPlayer} />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a player to view and edit their attributes.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;