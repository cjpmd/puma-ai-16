import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Edit } from "lucide-react";

interface PlayerCardHeaderProps {
  name: string;
  squadNumber: number;
  playerType: string;
  topPositions: [string, number][];
  onEdit?: () => void;
  onDownloadReport?: () => void;
}

export const PlayerCardHeader = ({
  name,
  squadNumber,
  playerType,
  topPositions,
  onEdit,
  onDownloadReport,
}: PlayerCardHeaderProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">
                {name} - #{squadNumber}
              </h2>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{playerType}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="icon" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDownloadReport && (
                <Button variant="outline" size="icon" onClick={onDownloadReport}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          {topPositions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Top Positions:</h3>
              <div className="flex gap-2">
                {topPositions.map(([position, minutes]) => (
                  <Badge key={position} variant="outline" className="bg-purple-500/10">
                    {position}: {minutes}m
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};