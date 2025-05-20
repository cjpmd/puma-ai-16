
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Player, PerformanceCategory } from '@/types/player';

// Component to display position ratings
const TopRatedByPosition = () => {
  const [activeTab, setActiveTab] = useState('field');
  const [selectedCategory, setSelectedCategory] = useState<PerformanceCategory>(PerformanceCategory.MESSI);
  
  // Fetch all players
  const { data: players, isLoading } = useQuery({
    queryKey: ['all-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          attributes:player_attributes(*)
        `);
        
      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }
      
      return data as Player[];
    }
  });
  
  // Fetch position suitability data
  const { data: positionData } = useQuery({
    queryKey: ['positions-suitability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('position_suitability')
        .select(`
          player_id,
          suitability_score,
          position_id,
          position_definitions(abbreviation, full_name)
        `)
        .order('suitability_score', { ascending: false });
        
      if (error) {
        console.error('Error fetching position suitability:', error);
        throw error;
      }
      
      // Transform data to be grouped by position
      const positionMap: Record<string, {id: string, player_id: string, score: number}[]> = {};
      
      data.forEach((item: any) => {
        const posAbbrev = item.position_definitions.abbreviation;
        if (!positionMap[posAbbrev]) {
          positionMap[posAbbrev] = [];
        }
        
        positionMap[posAbbrev].push({
          id: item.id,
          player_id: item.player_id,
          score: item.suitability_score
        });
        
        // Sort by score descending
        positionMap[posAbbrev].sort((a, b) => b.score - a.score);
      });
      
      return positionMap;
    }
  });
  
  // Function to get player by ID
  const getPlayerById = (playerId: string): Player | undefined => {
    return players?.find(p => p.id === playerId);
  };
  
  // Group positions by category
  const groupedPositions = {
    gk: ['GK'],
    defense: ['DL', 'DCL', 'DCR', 'DR', 'WBL', 'WBR'],
    midfield: ['DMCL', 'DMCR', 'ML', 'MCL', 'MCR', 'MR'],
    attack: ['AML', 'AMCL', 'AMCR', 'AMR', 'STCL', 'STCR']
  };
  
  // Render position cards
  const renderPositionCards = (positions: string[]) => {
    return positions.map(position => {
      const playersInPosition = positionData?.[position] || [];
      
      return (
        <Card key={position} className="col-span-1">
          <CardHeader>
            <CardTitle className="text-center">{position}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {playersInPosition.slice(0, 3).map((item, idx) => {
                const player = getPlayerById(item.player_id);
                if (!player) return null;
                
                return (
                  <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted">
                    <span>{player.name}</span>
                    <span className="font-bold">{Math.round(item.score)}%</span>
                  </div>
                );
              })}
              
              {playersInPosition.length === 0 && (
                <div className="text-center text-muted-foreground py-2">No players rated</div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  };
  
  if (isLoading) {
    return <div>Loading position data...</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Player Position Ratings</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Performance Category</h2>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={selectedCategory === PerformanceCategory.MESSI ? "default" : "outline"}
            onClick={() => setSelectedCategory(PerformanceCategory.MESSI)}
          >
            MESSI
          </Button>
          <Button 
            variant={selectedCategory === PerformanceCategory.RONALDO ? "default" : "outline"}
            onClick={() => setSelectedCategory(PerformanceCategory.RONALDO)}
          >
            RONALDO
          </Button>
          <Button 
            variant={selectedCategory === PerformanceCategory.JAGS ? "default" : "outline"}
            onClick={() => setSelectedCategory(PerformanceCategory.JAGS)}
          >
            JAGS
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="field" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="field">Field Players</TabsTrigger>
          <TabsTrigger value="goalkeepers">Goalkeepers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="field">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Defense</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {renderPositionCards(groupedPositions.defense)}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Midfield</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {renderPositionCards(groupedPositions.midfield)}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Attack</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {renderPositionCards(groupedPositions.attack)}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="goalkeepers">
          <div>
            <h2 className="text-xl font-semibold mb-4">Goalkeepers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {renderPositionCards(groupedPositions.gk)}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TopRatedByPosition;
