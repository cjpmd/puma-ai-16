
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X, Flag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SquadPlayersSectionProps {
  players: any[];
  squadPlayers: string[];
  onRemoveFromSquad: (playerId: string) => void;
  selectedPlayerId: string | null;
  onPlayerClick: (playerId: string) => void;
  squadMode: boolean;
  handleDragStart?: (e: React.DragEvent, playerId: string) => void;
  handleDragEnd?: () => void;
  isCaptain?: (playerId: string) => boolean;
  otherTeamIndicator?: (playerId: string) => React.ReactNode;
}

export const SquadPlayersSection: React.FC<SquadPlayersSectionProps> = ({
  players,
  squadPlayers,
  onRemoveFromSquad,
  selectedPlayerId,
  onPlayerClick,
  squadMode,
  handleDragStart,
  handleDragEnd,
  isCaptain,
  otherTeamIndicator
}) => {
  const getSquadPlayer = (playerId: string) => {
    return players.find(player => player.id === playerId);
  };

  // Debug output for troubleshooting
  console.log("SquadPlayersSection rendering with squad players:", squadPlayers);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {squadMode ? "Squad Players" : "Drag Players to Positions"}
        </CardTitle>
      </CardHeader>
      <CardContent className={`${squadMode ? 'max-h-56' : 'max-h-[400px]'} overflow-y-auto p-3`}>
        <ScrollArea className="h-full w-full pr-3">
          {squadPlayers.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {squadPlayers.map((playerId) => {
                const player = getSquadPlayer(playerId);
                if (!player) {
                  console.log("Missing player data for ID:", playerId);
                  return null;
                }
                
                const playerIsCaptain = isCaptain && isCaptain(player.id);
                
                return (
                  <div 
                    key={player.id}
                    className={`
                      rounded-md p-2 border cursor-pointer transition-colors relative
                      ${selectedPlayerId === player.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent border-border'}
                    `}
                    onClick={() => onPlayerClick(player.id)}
                    draggable={handleDragStart ? true : false}
                    onDragStart={(e) => handleDragStart && handleDragStart(e, player.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Avatar className="h-10 w-10 text-xs bg-blue-600 text-white relative">
                            <div className="font-bold">
                              {player.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                            </div>
                            {player.squad_number && (
                              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white flex items-center justify-center text-xs font-bold text-blue-700 border border-blue-600">
                                {player.squad_number}
                              </div>
                            )}
                            {playerIsCaptain && (
                              <div className="absolute -top-1 -right-1">
                                <Flag className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              </div>
                            )}
                          </Avatar>
                          {otherTeamIndicator && otherTeamIndicator(player.id)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{player.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-1">
                            {player.position && (
                              <Badge variant="outline" className="text-xs py-0 h-4">
                                {player.position}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {squadMode && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromSquad(player.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {squadMode 
                ? "No players added to squad yet" 
                : "No players available for selection"}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
