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
      <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
        {/* Strikers */}
        <div></div>
        <div>{renderPlayer("STCL")}</div>
        <div>{renderPlayer("STC")}</div>
        <div>{renderPlayer("STCR")}</div>
        <div></div>

        {/* Attacking Midfielders */}
        <div>{renderPlayer("AML")}</div>
        <div>{renderPlayer("AMCL")}</div>
        <div>{renderPlayer("AMC")}</div>
        <div>{renderPlayer("AMCR")}</div>
        <div>{renderPlayer("AMR")}</div>

        {/* Central Midfielders */}
        <div>{renderPlayer("ML")}</div>
        <div>{renderPlayer("MCL")}</div>
        <div>{renderPlayer("MC")}</div>
        <div>{renderPlayer("MCR")}</div>
        <div>{renderPlayer("MR")}</div>

        {/* Defensive Midfielders */}
        <div>{renderPlayer("WBR")}</div>
        <div>{renderPlayer("DCML")}</div>
        <div>{renderPlayer("DCM")}</div>
        <div>{renderPlayer("DCMR")}</div>
        <div>{renderPlayer("WBL")}</div>

        {/* Defenders */}
        <div>{renderPlayer("DL")}</div>
        <div>{renderPlayer("DCL")}</div>
        <div>{renderPlayer("DC")}</div>
        <div>{renderPlayer("DCR")}</div>
        <div>{renderPlayer("DR")}</div>

        {/* Sweeper Keeper */}
        <div></div>
        <div></div>
        <div>{renderPlayer("SK")}</div>
        <div></div>
        <div></div>

        {/* Goalkeeper */}
        <div></div>
        <div></div>
        <div>{renderPlayer("GK")}</div>
        <div></div>
        <div></div>
      </div>
    </Card>
  );
};
