
import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DraggablePlayer } from "./DraggablePlayer";
import { Crown } from "lucide-react";

// Types for player positions
interface PlayerPosition {
  playerId: string;
  position: { x: number; y: number };
  isSubstitution?: boolean;
}

interface DraggableFormationProps {
  selectedPlayers: Array<{ id: string; name: string; squad_number?: number }>;
  captainId?: string;
  initialPositions?: PlayerPosition[];
  onPositionsChange: (positions: PlayerPosition[]) => void;
  onCaptainChange: (playerId: string) => void;
  title?: string;
}

// Default player positions for a standard formation
const DEFAULT_POSITIONS = [
  { x: 50, y: 85 }, // GK
  { x: 20, y: 65 }, // LB
  { x: 40, y: 65 }, // CB
  { x: 60, y: 65 }, // CB
  { x: 80, y: 65 }, // RB
  { x: 30, y: 45 }, // LM
  { x: 50, y: 45 }, // CM
  { x: 70, y: 45 }, // RM
  { x: 30, y: 25 }, // LF
  { x: 50, y: 25 }, // CF
  { x: 70, y: 25 }, // RF
];

export const DraggableFormation = ({
  selectedPlayers,
  captainId,
  initialPositions = [],
  onPositionsChange,
  onCaptainChange,
  title = "Formation"
}: DraggableFormationProps) => {
  const pitchRef = useRef<HTMLDivElement>(null);
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([]);
  
  // Initialize player positions on mount or when selected players change
  useEffect(() => {
    if (initialPositions.length > 0) {
      // Use provided positions
      setPlayerPositions(initialPositions);
    } else {
      // Create default positions for players
      const newPositions = selectedPlayers.map((player, index) => ({
        playerId: player.id,
        position: DEFAULT_POSITIONS[index] || { 
          x: 20 + (index % 5) * 15, 
          y: 25 + Math.floor(index / 5) * 20 
        },
        isSubstitution: false
      }));
      
      setPlayerPositions(newPositions);
      onPositionsChange(newPositions);
    }
  }, [selectedPlayers.length]);
  
  // Update a player's position
  const handlePositionChange = (playerId: string, position: { x: number; y: number }) => {
    const updatedPositions = playerPositions.map(p => 
      p.playerId === playerId ? { ...p, position } : p
    );
    
    setPlayerPositions(updatedPositions);
    onPositionsChange(updatedPositions);
  };
  
  // Toggle player as captain
  const toggleCaptain = (playerId: string) => {
    onCaptainChange(playerId);
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div 
          ref={pitchRef}
          className="relative w-full h-[400px] bg-green-600 rounded-lg border-2 border-white mb-4"
          style={{
            backgroundImage: `
              linear-gradient(to right, white 1px, transparent 1px),
              linear-gradient(to bottom, white 1px, transparent 1px)
            `,
            backgroundSize: '20% 20%',
            backgroundPosition: 'center',
            boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] border-2 border-white rounded-full" />
          
          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[40px] border-b-2 border-l-2 border-r-2 border-white" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[40px] border-t-2 border-l-2 border-r-2 border-white" />
          
          {/* Players */}
          {playerPositions.map((playerPos) => {
            const player = selectedPlayers.find(p => p.id === playerPos.playerId);
            if (!player) return null;
            
            const isCaptain = captainId === player.id;
            
            return (
              <div key={player.id} className="relative">
                <DraggablePlayer
                  player={player}
                  position={playerPos.position}
                  onPositionChange={handlePositionChange}
                  containerRef={pitchRef}
                  isSubstitution={playerPos.isSubstitution}
                />
                
                {/* Captain indicator */}
                {isCaptain && (
                  <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <Crown className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
                
                {/* Captain button (appears on hover) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-0 right-0 h-5 w-5 opacity-0 group-hover:opacity-100 ${
                    isCaptain ? 'bg-yellow-400/20' : ''
                  }`}
                  onClick={() => toggleCaptain(player.id)}
                >
                  <Crown className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
        
        {/* Substitutes section */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Substitutes</h4>
          <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px]">
            {/* Will be populated when implementing substitution functionality */}
            <div className="text-sm text-muted-foreground">Drag players here to set as substitutes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
