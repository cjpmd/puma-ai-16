import { Card } from "@/components/ui/card";

interface Position {
  position: string;
  playerId: string;
}

interface Player {
  id: string;
  name: string;
  squad_number: number;
  age: number;
  dateOfBirth: string;
  playerType: string;
  attributes: any[];
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
      <div className="text-center text-sm bg-white/10 backdrop-blur-sm rounded-md p-2">
        <div className="font-semibold">{positionCode}</div>
        <div>{player.name}</div>
        {player.squad_number && <div className="text-gray-300">#{player.squad_number}</div>}
      </div>
    );
  };

  return (
    <Card className="p-4 mb-4">
      <div className="text-sm font-semibold mb-2">
        Period {periodNumber} ({duration} minutes)
      </div>
      <div className="relative bg-green-600 min-h-[500px] rounded-lg p-4">
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute top-0 left-0 right-0 border-t-4 border-white/70"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b-4 border-white/70 rounded-b-full"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 border-4 border-white/70 border-b-0"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 border-4 border-white/70 border-b-0"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/70"></div>
        </div>

        <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto relative z-10">
          <div></div>
          <div>{renderPlayer("STCL")}</div>
          <div>{renderPlayer("STC")}</div>
          <div>{renderPlayer("STCR")}</div>
          <div></div>

          <div>{renderPlayer("AML")}</div>
          <div>{renderPlayer("AMCL")}</div>
          <div>{renderPlayer("AMC")}</div>
          <div>{renderPlayer("AMCR")}</div>
          <div>{renderPlayer("AMR")}</div>

          <div>{renderPlayer("ML")}</div>
          <div>{renderPlayer("MCL")}</div>
          <div>{renderPlayer("MC")}</div>
          <div>{renderPlayer("MCR")}</div>
          <div>{renderPlayer("MR")}</div>

          <div>{renderPlayer("WBL")}</div>
          <div>{renderPlayer("DMCL")}</div>
          <div>{renderPlayer("DMC")}</div>
          <div>{renderPlayer("DMCR")}</div>
          <div>{renderPlayer("WBR")}</div>

          <div>{renderPlayer("DL")}</div>
          <div>{renderPlayer("DCL")}</div>
          <div>{renderPlayer("DC")}</div>
          <div>{renderPlayer("DCR")}</div>
          <div>{renderPlayer("DR")}</div>

          <div></div>
          <div></div>
          <div>{renderPlayer("SW")}</div>
          <div></div>
          <div></div>

          <div></div>
          <div></div>
          <div>{renderPlayer("GK")}</div>
          <div></div>
          <div></div>
        </div>
      </div>
    </Card>
  );
};
