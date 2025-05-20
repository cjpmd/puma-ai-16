// Fix for TopRatedByPosition PerformanceCategory usage
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PerformanceCategory } from '@/types/player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlayerRanking {
  id: string;
  name: string;
  squad_number?: number;
  profile_image?: string;
  suitability_score: number;
  position: string;
  position_name: string;
}

export const TopRatedByPosition = () => {
  const [selectedCategory, setSelectedCategory] = useState<PerformanceCategory>(PerformanceCategory.MESSI);
  const [selectedTab, setSelectedTab] = useState('gk');
  
  const { data: rankings, isLoading } = useQuery({
    queryKey: ['player-rankings', selectedCategory, selectedTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_position_rankings')
        .select(`
          players (id, name, squad_number, profile_image),
          suitability_score,
          position,
          position_definitions (abbreviation, full_name)
        `)
        .eq('performance_category', selectedCategory)
        .eq('position_category', selectedTab.toUpperCase())
        .order('suitability_score', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data?.map(item => ({
        id: item.players.id,
        name: item.players.name,
        squad_number: item.players.squad_number,
        profile_image: item.players.profile_image,
        suitability_score: item.suitability_score,
        position: item.position,
        position_name: item.position_definitions.full_name
      })) || [];
    }
  });
  
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 py-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
    ));
  };
  
  const renderRankings = () => {
    if (isLoading) return renderSkeletons();
    
    if (!rankings || rankings.length === 0) {
      return <p className="text-muted-foreground py-4">No players found for this position.</p>;
    }
    
    return rankings.map((player, index) => (
      <div key={player.id} className="flex items-center justify-between py-2 border-b last:border-0">
        <div className="flex items-center space-x-3">
          <div className="font-bold text-lg w-6 text-center">{index + 1}</div>
          <Avatar className="h-10 w-10">
            <AvatarImage src={player.profile_image || ''} alt={player.name} />
            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="text-sm text-muted-foreground">
              {player.squad_number ? `#${player.squad_number} · ` : ''}
              {player.position_name}
            </div>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-500/10">
          {player.suitability_score.toFixed(1)}
        </Badge>
      </div>
    ));
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Top Rated Players By Position</h1>
        
        <div className="flex space-x-2">
          <Button 
            variant={selectedCategory === PerformanceCategory.MESSI ? "default" : "outline"}
            onClick={() => setSelectedCategory(PerformanceCategory.MESSI)}
            className="relative"
          >
            Messi
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
          </Button>
          <Button 
            variant={selectedCategory === PerformanceCategory.RONALDO ? "default" : "outline"}
            onClick={() => setSelectedCategory(PerformanceCategory.RONALDO)}
            className="relative"
          >
            Ronaldo
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
          </Button>
          <Button 
            variant={selectedCategory === PerformanceCategory.JAGS ? "default" : "outline"}
            onClick={() => setSelectedCategory(PerformanceCategory.JAGS)}
            className="relative"
          >
            Jags
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"></span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Player Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gk" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="gk">Goalkeepers</TabsTrigger>
              <TabsTrigger value="def">Defenders</TabsTrigger>
              <TabsTrigger value="mid">Midfielders</TabsTrigger>
              <TabsTrigger value="fwd">Forwards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="gk" className="mt-0">
              <ScrollArea className="h-[400px]">
                {renderRankings()}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="def" className="mt-0">
              <ScrollArea className="h-[400px]">
                {renderRankings()}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="mid" className="mt-0">
              <ScrollArea className="h-[400px]">
                {renderRankings()}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="fwd" className="mt-0">
              <ScrollArea className="h-[400px]">
                {renderRankings()}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopRatedByPosition;
