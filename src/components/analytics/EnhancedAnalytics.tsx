
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";

interface PositionDistribution {
  name: string;
  value: number;
}

interface PlayerTimeSeries {
  date: string;
  opponent: string;
  total: number;
  [playerName: string]: string | number;
}

interface PlayerMetrics {
  id: string;
  name: string;
  squad_number: number | null;
  versatility: number;
  consistency: number;
  development: number;
}

// Define additional interfaces for better type safety
interface FixturePlayerPosition {
  player_id: string;
  position: string;
  players?: {
    name: string;
  };
  fixture_playing_periods?: {
    duration_minutes: number;
  }[];
}

interface Fixture {
  id: string;
  date: string;
  opponent: string;
  fixture_player_positions?: FixturePlayerPosition[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0'];

export const EnhancedAnalytics = () => {
  // Player performance over time
  const { data: performanceTrends, isLoading: loadingTrends } = useQuery<PlayerTimeSeries[]>({
    queryKey: ["performance-trends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select(`
          id,
          date,
          opponent,
          fixture_player_positions (
            player_id,
            position,
            players (name),
            fixture_playing_periods (duration_minutes)
          )
        `)
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      // Process data to track player minutes over time
      const playerTimeSeries: Record<string, PlayerTimeSeries> = {};
      
      (data as Fixture[] || []).forEach(fixture => {
        const date = new Date(fixture.date).toISOString().split('T')[0];
        
        fixture.fixture_player_positions?.forEach(position => {
          const playerId = position.player_id;
          const playerName = position.players?.name || 'Unknown Player';
          
          if (!playerName) return;
          
          const minutes = position.fixture_playing_periods?.reduce((sum, period) => 
            sum + (period.duration_minutes || 0), 0) || 0;
            
          if (!playerTimeSeries[date]) {
            playerTimeSeries[date] = { 
              date, 
              opponent: fixture.opponent || 'Unknown', 
              total: 0
            };
          }
          
          playerTimeSeries[date][playerName] = (playerTimeSeries[date][playerName] || 0) + minutes;
          playerTimeSeries[date].total += minutes;
        });
      });
      
      return Object.values(playerTimeSeries).slice(-10); // Last 10 fixtures
    }
  });

  // Position distribution analysis
  const { data: positionDistribution, isLoading: loadingPositions } = useQuery<PositionDistribution[]>({
    queryKey: ["position-distribution"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixture_player_positions")
        .select("position");
        
      if (error) throw error;
      
      const positionCounts: Record<string, number> = {};
      
      if (data) {
        data.forEach(record => {
          const position = record.position || 'Unknown';
          positionCounts[position] = (positionCounts[position] || 0) + 1;
        });
      }
      
      return Object.entries(positionCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }
  });

  // Advanced player metrics
  const { data: advancedMetrics, isLoading: loadingMetrics } = useQuery<PlayerMetrics[]>({
    queryKey: ["player-advanced-metrics"],
    queryFn: async () => {
      // This would ideally come from a more sophisticated data source
      // For now, we'll simulate by combining multiple data sources
      
      const { data: players } = await supabase
        .from("players")
        .select("id, name, squad_number");
      
      const { data: positions } = await supabase
        .from("fixture_player_positions")
        .select(`
          player_id,
          fixture_id,
          position
        `);
      
      // Calculate versatility (number of different positions played)
      const versatility: Record<string, Set<string>> = {};
      
      positions?.forEach(pos => {
        if (!pos.player_id || !pos.position) return;
        
        if (!versatility[pos.player_id]) {
          versatility[pos.player_id] = new Set();
        }
        
        versatility[pos.player_id].add(pos.position);
      });
      
      return players?.map(player => {
        const positionsPlayed = versatility[player.id]?.size || 0;
        
        return {
          id: player.id,
          name: player.name,
          squad_number: player.squad_number,
          versatility: positionsPlayed,
          consistency: Math.round(Math.random() * 5) + 5, // Placeholder metric (1-10)
          development: Math.round(Math.random() * 40) + 60 // Placeholder metric (60-100%)
        };
      }).sort((a, b) => b.versatility - a.versatility);
    }
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends">
        <TabsList className="mb-4">
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="positions">Position Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Advanced Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Player Minutes Trend</CardTitle>
              <CardDescription>
                Track player minutes over the last 10 fixtures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTrends ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{fontSize: 12}}
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {performanceTrends && performanceTrends.length > 0 && 
                        Object.keys(performanceTrends[0])
                          .filter(key => !['date', 'opponent', 'total'].includes(key))
                          .slice(0, 5) // Limit to top 5 players for clarity
                          .map((player, index) => (
                            <Line 
                              key={player} 
                              type="monotone" 
                              dataKey={player} 
                              stroke={COLORS[index % COLORS.length]} 
                              activeDot={{ r: 8 }} 
                            />
                          ))
                      }
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>Position Distribution</CardTitle>
              <CardDescription>
                Analysis of positions played across all fixtures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPositions ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={positionDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {positionDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Player Metrics</CardTitle>
              <CardDescription>
                Player versatility and performance analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMetrics ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={advancedMetrics?.slice(0, 10) || []} // Top 10 most versatile players
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 12 }} 
                      />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="versatility" 
                        fill="#8884d8" 
                        name="Positions Played" 
                      />
                      <Bar 
                        dataKey="consistency" 
                        fill="#82ca9d" 
                        name="Consistency (1-10)" 
                      />
                      <Bar 
                        dataKey="development" 
                        fill="#ffc658" 
                        name="Development %" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
