
import { Player } from "@/types/player";
import { EditPlayerDialog } from "@/components/EditPlayerDialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PlayerHeaderProps {
  player: Player;
  topPositions?: any[];
  showAttributeVisuals: boolean;
  onPlayerUpdated?: () => void;
}

export const PlayerHeader = ({ 
  player, 
  topPositions, 
  showAttributeVisuals,
  onPlayerUpdated = () => window.location.reload()
}: PlayerHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/20">
          {player.profileImage ? (
            <AvatarImage src={player.profileImage} alt={player.name} />
          ) : (
            <AvatarFallback className="text-3xl font-bold">
              {player.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <Badge variant="outline">{player.age} yrs</Badge>
            <Badge variant="outline">#{player.squadNumber}</Badge>
          </div>
          
          {showAttributeVisuals && topPositions && topPositions.length > 0 && (
            <div className="flex gap-2 mt-1">
              {topPositions.slice(0, 3).map((pos, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`${index === 0 ? 'bg-green-500/10' : index === 1 ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}
                >
                  {pos.position_definitions?.abbreviation || pos.position} 
                  {pos.suitability_score && ` (${Number(pos.suitability_score).toFixed(1)}%)`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <EditPlayerDialog player={player} onPlayerUpdated={onPlayerUpdated} />
    </div>
  );
};
