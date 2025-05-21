
// Fixed implementation for PlayerDetailsPage to properly handle profile_image and other properties

import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PlayerDetails } from '@/components/PlayerDetails';
import { Player, transformDbPlayerToPlayer } from '@/types/player';
import { Card } from '@/components/ui/card';

const PlayerDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: player, isLoading, refetch } = useQuery({
    queryKey: ['player', id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch player base data
      const { data: playerData, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching player:', error);
        throw error;
      }

      // Fetch player attributes
      const { data: attributesData, error: attributesError } = await supabase
        .from('player_attributes')
        .select('*')
        .eq('player_id', id);

      if (attributesError) {
        console.error('Error fetching attributes:', attributesError);
      }

      // Fetch attribute history
      const { data: attributeHistoryData, error: historyError } = await supabase
        .from('attribute_history')
        .select('*')
        .eq('player_id', id);

      if (historyError) {
        console.error('Error fetching attribute history:', historyError);
      }

      // Process attribute history data
      const attributeHistory: Record<string, { date: string; value: number }[]> = {};
      
      if (attributeHistoryData) {
        attributeHistoryData.forEach((record: any) => {
          if (!attributeHistory[record.name]) {
            attributeHistory[record.name] = [];
          }
          attributeHistory[record.name].push({
            date: record.created_at,
            value: record.previous_value
          });
        });
        
        // Add current values to history
        attributesData?.forEach((attr: any) => {
          if (!attributeHistory[attr.name]) {
            attributeHistory[attr.name] = [];
          }
          attributeHistory[attr.name].push({
            date: new Date().toISOString(),
            value: attr.value
          });
        });
      }

      console.log('Player data loaded:', playerData);

      // Enhanced player data with profile_image property
      const playerWithEnhancedData = {
        ...playerData,
        profile_image: playerData.profile_image || undefined,
        profileImage: playerData.profile_image || undefined,
        attributes: attributesData || [],
        attributeHistory: attributeHistory,
        // Ensure required fields
        id: playerData.id,
        name: playerData.name,
        age: playerData.age || 0,
        player_type: playerData.player_type,
        date_of_birth: playerData.date_of_birth,
        self_linked: playerData.self_linked || false,
        created_at: playerData.created_at,
        updated_at: playerData.updated_at,
        // Legacy camelCase aliases
        squadNumber: playerData.squad_number,
        playerType: playerData.player_type,
        dateOfBirth: playerData.date_of_birth,
        teamCategory: playerData.team_category
      };

      return playerWithEnhancedData as Player;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading player...</div>;
  }

  if (!player) {
    return <div>Player not found</div>;
  }

  return (
    <div className="p-4">
      <Card className="p-6">
        <PlayerDetails player={player} onPlayerUpdated={() => refetch()} />
      </Card>
    </div>
  );
};

export default PlayerDetailsPage;
