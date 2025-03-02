
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Save } from "lucide-react";

interface SquadSelectionGridProps {
  availablePlayers: any[];
  selectedPlayers?: string[];
  onSelectionChange: (playerIds: string[]) => void;
  getPlayerTeams?: (playerId: string) => string[];
  onSaveSelection?: () => void;
}

export const SquadSelectionGrid = ({ 
  availablePlayers, 
  selectedPlayers = [], 
  onSelectionChange,
  getPlayerTeams,
  onSaveSelection
}: SquadSelectionGridProps) => {
  const [search, setSearch] = useState("");
  const [localSelectedPlayers, setLocalSelectedPlayers] = useState<string[]>(selectedPlayers);
  const [isEditMode, setIsEditMode] = useState(true);
  
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
    if (!isEditMode) return;
    
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

  // Handle save button click
  const handleSaveClick = () => {
    setIsEditMode(false);
    onSaveSelection?.();
  };

  // Handle edit button click
  const handleEditClick = () => {
    setIsEditMode(true);
  };
  
  // Determine which players to display based on edit mode
  const playersToDisplay = isEditMode 
    ? filteredPlayers 
    : filteredPlayers.filter(player => localSelectedPlayers.includes(player.id));
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search players by name or squad number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
          disabled={!isEditMode}
        />
        {isEditMode ? (
          <Button onClick={handleSaveClick}>
            <Save className="h-4 w-4 mr-2" />
            Save Selection
          </Button>
        ) : (
          <Button onClick={handleEditClick} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Selection
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {playersToDisplay.map(player => {
          const isSelected = localSelectedPlayers.includes(player.id);
          const playerTeams = getPlayerTeams ? getPlayerTeams(player.id) : [];
          const isInOtherTeams = playerTeams.length > 0 && !isSelected;
          
          return (
            <Button
              key={player.id}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto py-2 px-2 relative", 
                isSelected ? "bg-blue-500" : "",
                !isEditMode && !isSelected ? "hidden" : ""
              )}
              onClick={() => togglePlayerSelection(player.id)}
              disabled={!isEditMode && !isSelected}
            >
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold mb-1",
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
                        className="w-2.5 h-2.5 bg-amber-500 text-[7px] flex items-center justify-center rounded-full text-white"
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
