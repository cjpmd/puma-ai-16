
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Pencil } from "lucide-react";
import { Player } from "@/types/player";

interface PlayerCardHeaderProps {
  player: Player;
  name: string;
  squadNumber: number | undefined;
  playerType: string;
  topPositions: [string, number][];
  onEdit?: () => void;
  onDownloadReport?: () => void;
}

export const PlayerCardHeader = ({
  player,
  name,
  squadNumber,
  playerType,
  topPositions,
  onEdit,
  onDownloadReport,
}: PlayerCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start p-6">
      <div className="space-y-1">
        <div>
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {name} {squadNumber ? `- #${squadNumber}` : ''}
              </h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{playerType}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          {topPositions.slice(0, 3).map(([pos, score]) => (
            <Badge key={pos} variant="secondary">
              {pos}: {score}%
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        {onEdit && (
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {onDownloadReport && (
          <Button variant="ghost" size="icon" onClick={onDownloadReport}>
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
