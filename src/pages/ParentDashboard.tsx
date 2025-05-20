
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ParentDashboard = () => {
  const { profile } = useAuth();
  const parentId = profile?.id;
  
  // Use strongly typed query results to avoid infinite type issues
  interface ParentPlayer {
    id: string;
    name: string;
    team_category?: string;
    player_id?: string;
  }
  
  const { data: linkedPlayers, isLoading } = useQuery({
    queryKey: ['parent-players', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      
      // Get linked children players
      const { data, error } = await supabase
        .from('parent_child_linking')
        .select('player_id, players:player_id(id, name, team_category)')
        .eq('parent_id', parentId);
      
      if (error) {
        console.error('Error fetching linked players:', error);
        return [];
      }
      
      // Transform to array of player objects
      const players = data
        .map(link => link.players as ParentPlayer)
        .filter(Boolean); // Remove any nulls
        
      return players;
    },
    enabled: !!parentId
  });
  
  if (isLoading) {
    return <div>Loading players...</div>;
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Parent Dashboard</h1>
      
      <h2 className="text-xl font-medium mb-4">Your Linked Players</h2>
      {!linkedPlayers || linkedPlayers.length === 0 ? (
        <div className="text-muted-foreground">
          No players linked to your account yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {linkedPlayers.map(player => (
            <Card key={player.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{player.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Team: {player.team_category || 'No team assigned'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
