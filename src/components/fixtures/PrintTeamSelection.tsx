import React from 'react';
import { format } from 'date-fns';

interface PrintTeamSelectionProps {
  fixture: {
    id: string;
    date: string;
    opponent: string;
    time?: string | null;
    location?: string | null;
  };
  periods: Array<{
    id: string;
    start_minute: number;
    duration_minutes: number;
  }>;
  players: Array<{
    id: string;
    name: string;
    squad_number: number;
  }>;
}

export const PrintTeamSelection: React.FC<PrintTeamSelectionProps> = ({
  fixture,
  periods,
  players,
}) => {
  if (!fixture) {
    return null;
  }

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
            Period {periodIndex + 1} ({period.duration_minutes} minutes)
          </h2>
          
          <div className="grid grid-cols-2 gap-8">
            {/* Starting XI */}
            <div>
              <h3 className="text-lg font-medium mb-2">Starting XI</h3>
              <div className="space-y-1">
                {players.map((player, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-16 font-medium">{idx + 1}</span>
                    <span>
                      {player.name} (#{player.squad_number})
                    </span>
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