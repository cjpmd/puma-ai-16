import { Card } from "@/components/ui/card";

interface Position {
  position: string;
  playerId: string;
}

interface Player {
  id: string;
  name: string;
  squad_number: number;
}

interface FormationViewProps {
  positions: Position[];
  players: Player[];
  periodNumber: number;
  duration: number;
}

export const FormationView = ({ positions, players, periodNumber, duration }: FormationViewProps) => {
  const getPlayerForPosition = (positionCode: string) => {
    const position = positions.find(p => p.position === positionCode);
    if (!position) return null;
    return players.find(p => p.id === position.playerId);
  };

  const renderPlayer = (positionCode: string) => {
    const player = getPlayerForPosition(positionCode);
    if (!player) return null;
    return (
      <div className="text-center text-xs">
        <div className="font-semibold">{positionCode}</div>
        <div>{player.name}</div>
        <div className="text-gray-500">#{player.squad_number}</div>
      </div>
    );
  };

  return (
    <Card className="p-4 mb-4">
      <div className="text-sm font-semibold mb-2">
        Period {periodNumber} ({duration} minutes)
      </div>
      <div className="grid grid-cols-7 gap-2 max-w-2xl mx-auto">
        {/* Strikers */}
        <div className="col-span-3">{renderPlayer("STCL")}</div>
        <div className="col-span-1"></div>
        <div className="col-span-3">{renderPlayer("STCR")}</div>

        {/* Attacking Midfielders */}
        <div>{renderPlayer("AML")}</div>
        <div>{renderPlayer("AMCL")}</div>
        <div>{renderPlayer("AMC")}</div>
        <div>{renderPlayer("AMCR")}</div>
        <div>{renderPlayer("AMR")}</div>
        <div className="col-span-2"></div>

        {/* Central Midfielders */}
        <div>{renderPlayer("ML")}</div>
        <div>{renderPlayer("MCL")}</div>
        <div>{renderPlayer("MC")}</div>
        <div>{renderPlayer("MCR")}</div>
        <div>{renderPlayer("MR")}</div>
        <div className="col-span-2"></div>

        {/* Defensive Midfielders */}
        <div>{renderPlayer("WBR")}</div>
        <div>{renderPlayer("DCML")}</div>
        <div>{renderPlayer("DCM")}</div>
        <div>{renderPlayer("DCMR")}</div>
        <div>{renderPlayer("WBL")}</div>
        <div className="col-span-2"></div>

        {/* Defenders */}
        <div>{renderPlayer("DL")}</div>
        <div>{renderPlayer("DCL")}</div>
        <div className="col-span-3"></div>
        <div>{renderPlayer("DCR")}</div>
        <div>{renderPlayer("DR")}</div>

        {/* Goalkeeper */}
        <div className="col-span-3"></div>
        <div>{renderPlayer("GK")}</div>
        <div className="col-span-3"></div>
      </div>
    </Card>
  );
};
