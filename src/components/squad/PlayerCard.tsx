
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Player } from '@/types/player';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onClick }) => {
  return (
    <Card 
      className="border cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center mb-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
            {player.profile_image ? (
              <img 
                src={player.profile_image} 
                alt={player.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold">{player.squad_number}</span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{player.name}</h3>
            <div className="text-sm text-muted-foreground">
              {player.team_category || 'No Category'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
