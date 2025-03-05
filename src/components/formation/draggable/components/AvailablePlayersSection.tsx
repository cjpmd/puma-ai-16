
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

interface AvailablePlayersSectionProps {
  players: any[];
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  squadPlayers: string[];
  onAddToSquad: (playerId: string) => void;
  squadMode: boolean;
  handleDragStart?: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd?: () => void;
}

export const AvailablePlayersSection: React.FC<AvailablePlayersSectionProps> = ({
  players,
  selectedPlayerId,
  onPlayerClick,
  squadPlayers,
  onAddToSquad,
  squadMode,
  handleDragStart,
  handleDragEnd
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter players by search term
  const filteredPlayers = players.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selectable players (filter out already selected players for squad mode)
  const getSelectablePlayers = () => {
    if (squadMode) {
      return filteredPlayers.filter(player => !squadPlayers.includes(player.id));
    }
    return filteredPlayers;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Available Players</CardTitle>
        <div className="relative mt-1">
          <Input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent className="max-h-56 overflow-y-auto p-3">
        {getSelectablePlayers().length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {getSelectablePlayers().map((player) => (
              <div 
                key={player.id}
                className={`
                  rounded-md p-2 border cursor-pointer transition-colors
                  ${selectedPlayerId === player.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border'}
                `}
                onClick={() => onPlayerClick(player.id)}
                draggable={handleDragStart ? true : false}
                onDragStart={handleDragStart ? (e) => handleDragStart(e, player.id) : undefined}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center space-x-2">
                  <Avatar className="h-7 w-7 text-xs">
                    <div className="font-bold">
                      {player.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                    </div>
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <div className="truncate text-sm font-medium">
                      {player.name}
                    </div>
                    {player.squad_number && (
                      <div className="text-xs text-muted-foreground">
                        #{player.squad_number}
                      </div>
                    )}
                  </div>
                  {squadMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-primary hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToSquad(player.id);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm 
              ? "No players found matching your search" 
              : (squadMode 
                  ? "All available players are already in your squad" 
                  : "No players available")}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
