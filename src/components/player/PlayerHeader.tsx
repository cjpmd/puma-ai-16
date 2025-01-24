import { EditPlayerDialog } from "../EditPlayerDialog";
import { Button } from "../ui/button";
import { FileDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { Player } from "@/types/player";

interface PlayerHeaderProps {
  player: Player;
  topPositions: any[] | undefined;
  showAttributeVisuals: boolean;
}

export const PlayerHeader = ({ player, topPositions, showAttributeVisuals }: PlayerHeaderProps) => {
  const { toast } = useToast();

  const handleDownloadReport = async () => {
    toast({
      title: "Downloading report...",
      description: "Your report will be ready shortly.",
    });
    // TODO: Implement report download logic
  };

  return (
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <CardTitle>
          {player.name} - #{player.squadNumber}
        </CardTitle>
        <EditPlayerDialog player={player} onPlayerUpdated={() => {
          window.location.reload();
        }} />
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={handleDownloadReport}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>
      {topPositions && showAttributeVisuals && (
        <div className="flex gap-2">
          {topPositions.map((pos: any) => (
            <Badge key={pos.position_definitions.abbreviation} variant="outline">
              {pos.position_definitions.full_name} ({pos.position_definitions.abbreviation})
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};