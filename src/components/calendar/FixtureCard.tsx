import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Fixture } from '@/types';
import { KitIcon } from '@/components/fixtures/KitIcon';
import { Edit, Trash2 } from 'lucide-react';

type FixtureCardProps = {
  fixture: Fixture;
  onEdit: (fixture: Fixture) => void;
  onDelete: (id: string) => void;
};

const FixtureCard = ({ fixture, onEdit, onDelete }: FixtureCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fixtureDate = fixture.date ? new Date(fixture.date) : null;
  const formattedDate = fixtureDate ? format(fixtureDate, 'EEE, d MMM yyyy') : 'Date not set';
  const formattedTime = fixtureDate ? format(fixtureDate, 'h:mm a') : 'Time not set';

  const homeTeamName = fixture.home_team_name || 'Home Team';
  const awayTeamName = fixture.away_team_name || 'Away Team';

  const homeTeamData = fixture.home_team;
  const awayTeamData = fixture.away_team;

  return (
    <div className="border rounded-lg shadow-sm bg-card overflow-hidden mb-4">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{formattedDate}</h3>
          <div className="space-x-2">
            <Button 
              variant="outline"
              size="icon"
              onClick={() => onEdit(fixture)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive"
              size="icon"
              onClick={() => onDelete(fixture.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{formattedTime}</p>
        
        <div className="mt-3">
          <p className="text-sm">
            {fixture.location && (
              <>
                <strong>Location:</strong> {fixture.location}
              </>
            )}
          </p>
          {isExpanded && (
            <div className="mt-2">
              {fixture.notes && (
                <p className="text-sm">
                  <strong>Notes:</strong> {fixture.notes}
                </p>
              )}
            </div>
          )}
          <Button 
            variant="link" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/30 border-t">
        <div className="flex items-center space-x-2">
          {homeTeamData && (
            <KitIcon 
              teamData={homeTeamData} 
              type="home" 
              size="small" // Changed from numeric to string value
            />
          )}
          <span className="text-sm font-medium">{homeTeamName || 'Home Team'}</span>
        </div>
        
        <div className="text-lg font-medium">vs</div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{awayTeamName || 'Away Team'}</span>
          {awayTeamData && (
            <KitIcon 
              teamData={awayTeamData} 
              type="away" 
              size="small" // Changed from numeric to string value
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FixtureCard;
