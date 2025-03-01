
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SquadSelectionGridProps {
  availablePlayers: any[];
  selectedPlayers?: string[];
  onSelectionChange: (playerIds: string[]) => void;
  getPlayerTeams?: (playerId: string) => string[];
}

export const SquadSelectionGrid = ({ 
  availablePlayers, 
  selectedPlayers = [], 
  onSelectionChange,
  getPlayerTeams
}: SquadSelectionGridProps) => {
  const [search, setSearch] = useState("");
  const [localSelectedPlayers, setLocalSelectedPlayers] = useState<string[]>(selectedPlayers);
  
  // Update local state when selectedPlayers changes
  useEffect(() => {
    setLocalSelectedPlayers(selectedPlayers);
  }, [selectedPlayers]);
  
  // Filter players by search term
  const filteredPlayers = availablePlayers.filter(player => 
    player.name.toLowerCase().includes(search.toLowerCase()) ||
    (player.squad_number && player.squad_number.toString().includes(search))
  );
  
  // Toggle player selection
  const togglePlayerSelection = (playerId: string) => {
    const isSelected = localSelectedPlayers.includes(playerId);
    let updatedSelection;
    
    if (isSelected) {
      updatedSelection = localSelectedPlayers.filter(id => id !== playerId);
    } else {
      updatedSelection = [...localSelectedPlayers, playerId];
    }
    
    setLocalSelectedPlayers(updatedSelection);
    onSelectionChange(updatedSelection);
  };
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search players by name or squad number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredPlayers.map(player => {
          const isSelected = localSelectedPlayers.includes(player.id);
          const playerTeams = getPlayerTeams ? getPlayerTeams(player.id) : [];
          const isInOtherTeams = playerTeams.length > 0 && !isSelected;
          
          return (
            <Button
              key={player.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto py-2 px-2 relative", // Reduced padding
                isSelected ? "bg-blue-500" : ""
              )}
              onClick={() => togglePlayerSelection(player.id)}
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold mb-1", // Reduced size, font, and margin
                  isSelected ? "bg-white text-blue-500" : "bg-blue-100 text-blue-800"
                )}>
                  {player.squad_number || player.name.charAt(0)}
                </div>
                <span className="text-xs font-medium">
                  {player.name.length > 15 ? `${player.name.substring(0, 15)}...` : player.name}
                </span>
                {player.squad_number && (
                  <span className="text-[10px] opacity-70">#{player.squad_number}</span>
                )}
                
                {/* Show which other teams the player is in */}
                {isInOtherTeams && (
                  <div className="absolute top-1 right-1 flex gap-0.5">
                    {playerTeams.map(teamId => (
                      <span 
                        key={teamId} 
                        className="w-3 h-3 bg-amber-500 text-[8px] flex items-center justify-center rounded-full text-white"
                        title={`Also in Team ${parseInt(teamId) + 1}`}
                      >
                        {parseInt(teamId) + 1}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
