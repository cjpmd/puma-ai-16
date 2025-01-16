import React from 'react';
import { format } from 'date-fns';

interface PrintTeamSelectionProps {
  fixture: {
    date: string;
    opponent: string;
    time?: string | null;
    location?: string | null;
  };
  periods: Array<{
    duration: number;
    positions: Array<{
      position: string;
      playerId: string;
    }>;
    substitutes: Array<{
      playerId: string;
    }>;
  }>;
  players: Array<{
    id: string;
    name: string;
    squad_number: number;
  }>;
  captain?: string;
}

export const PrintTeamSelection: React.FC<PrintTeamSelectionProps> = ({
  fixture,
  periods,
  players,
  captain,
}) => {
  const getPlayerName = (playerId: string) => {
    const player = players?.find(p => p.id === playerId);
    return player ? `${player.name} (${player.squad_number})` : '';
  };

  return (
    <div className="print-only p-8 hidden">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Team Selection</h1>
        <p className="text-lg">
          {fixture.opponent} - {format(new Date(fixture.date), 'dd/MM/yyyy')}
          {fixture.time && ` at ${fixture.time}`}
        </p>
        {fixture.location && (
          <p className="text-md text-muted-foreground">{fixture.location}</p>
        )}
      </div>

      {periods.map((period, periodIndex) => (
        <div key={periodIndex} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Period {periodIndex + 1} ({period.duration} minutes)
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Starting XI */}
            <div>
              <h3 className="text-lg font-medium mb-2">Starting XI</h3>
              <div className="space-y-1">
                {period.positions.map((pos, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-16 font-medium">{pos.position}</span>
                    <span>
                      {getPlayerName(pos.playerId)}
                      {captain === pos.playerId && " (C)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Substitutes */}
            <div>
              <h3 className="text-lg font-medium mb-2">Substitutes</h3>
              <div className="space-y-1">
                {period.substitutes.map((sub, idx) => (
                  <div key={idx}>
                    {getPlayerName(sub.playerId)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};