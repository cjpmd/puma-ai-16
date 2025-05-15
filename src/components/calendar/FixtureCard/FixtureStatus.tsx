
import React from 'react';
import { cn } from "@/lib/utils";
import { Fixture } from "@/types/fixture";
import { KitIcon } from "@/components/fixtures/KitIcon";

type FixtureStatusProps = {
  fixture: Fixture;
  condensed?: boolean;
};

export const FixtureStatus = ({ fixture, condensed = false }: FixtureStatusProps) => {
  const { status, home_team_name, away_team_name, home_team_data, away_team_data } = fixture;
  
  const homeTeamName = home_team_name || 'Home Team';
  const awayTeamName = away_team_name || 'Away Team';
  const homeTeamData = home_team_data || null;
  const awayTeamData = away_team_data || null;

  return (
    <div className={cn("flex items-center", condensed ? "gap-1" : "gap-2")}>
      {status === 'scheduled' && (
        <span className="text-muted-foreground">Upcoming</span>
      )}
      
      {status === 'live' && (
        <span className="text-green-500">Live</span>
      )}
      
      {status === 'completed' ? (
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">{fixture.home_team_score}</span>
          <span>-</span>
          <span className="text-muted-foreground">{fixture.away_team_score}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {homeTeamData && (
              <KitIcon 
                teamData={homeTeamData} 
                type="home" 
                size="small"
              />
            )}
            <span className="text-sm">{homeTeamName}</span>
          </div>
          
          <span className="text-muted-foreground">vs</span>
          
          <div className="flex items-center gap-1">
            {awayTeamData && (
              <KitIcon 
                teamData={awayTeamData} 
                type="away" 
                size="small"
              />
            )}
            <span className="text-sm">{awayTeamName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
