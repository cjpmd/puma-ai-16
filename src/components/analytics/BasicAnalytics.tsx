
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlayerMinutes {
  id: string;
  name: string;
  minutes: number;
}

interface FixtureCategory {
  name: string;
  value: number;
}

export const BasicAnalytics = () => {
  const { data: playerMinutes, isLoading: loadingMinutes } = useQuery({
    queryKey: ["basic-minutes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_player_positions")
        .select(`
          player_id,
          fixture_id,
          players (name),
          fixture_playing_periods (duration_minutes)
        `)
        .order('player_id');
        
      if (error) throw error;
      
      // Process the data to get minutes by player
      const playerMap = new Map<string, PlayerMinutes>();
      
      data?.forEach(record => {
        const playerId = record.player_id;
        const playerName = record.players?.name || 'Unknown Player';
        const minutes = record.fixture_playing_periods?.reduce((sum, period) => 
          sum + (period.duration_minutes || 0), 0) || 0;
          
        if (!playerMap.has(playerId)) {
          playerMap.set(playerId, { 
            id: playerId,
            name: playerName, 
            minutes: 0 
          });
        }
        
        const player = playerMap.get(playerId);
        if (player) {
          player.minutes += minutes;
        }
      });
      
      return Array.from(playerMap.values())
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 10); // Top 10 players by minutes
    }
  });

  const { data: fixtureCount, isLoading: loadingFixtures } = useQuery({
    queryKey: ["fixture-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("date, category");
        
      if (error) throw error;
      
      const categories: Record<string, number> = data.reduce((acc, fixture) => {
        const category = fixture.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Players by Minutes Played</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingMinutes ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={playerMinutes || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" name="Minutes Played" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fixtures by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFixtures ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixtureCount?.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right">{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
