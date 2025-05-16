
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Award, Clock, BarChart2, TrendingUp, FileChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TeamStats {
  totalPlayers: number;
  totalMinutesPlayed: number;
  totalGames: number;
  trainingSessions: number;
  festivals: number;
  tournaments: number;
  playersWithoutMinutes: number;
  averageMinutesPerPlayer: number;
  mostGamesPlayer?: { name: string; games: number };
  mostMinutesPlayer?: { name: string; minutes: number };
}

interface PlayerStats {
  id: string;
  name: string;
  squad_number?: number;
  games_played: number;
  minutes_played: number;
  goals?: number;
  assists?: number;
  motm?: number;
}

export const TeamDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalPlayers: 0,
    totalMinutesPlayed: 0,
    totalGames: 0,
    trainingSessions: 0,
    festivals: 0,
    tournaments: 0,
    playersWithoutMinutes: 0,
    averageMinutesPerPlayer: 0
  });
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get team info
        const { data: teamData } = await supabase
          .from('teams')
          .select('team_name')
          .single();

        if (teamData) {
          setTeamName(teamData.team_name);
        }

        // Fetch players
        const { data: players, error: playersError } = await supabase
          .from('players')
          .select('id, name, squad_number');
        
        if (playersError) throw playersError;

        // Fetch fixtures
        const { data: fixtures, error: fixturesError } = await supabase
          .from('fixtures')
          .select('id, date');
        
        if (fixturesError) throw fixturesError;

        // Fetch player minutes
        const { data: playerPositions, error: positionsError } = await supabase
          .from('fixture_player_positions')
          .select(`
            player_id,
            fixture_id,
            position,
            fixture_playing_periods (
              duration_minutes
            )
          `);
        
        if (positionsError) throw positionsError;

        // Fetch training sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('id, type');
        
        if (sessionsError) throw sessionsError;

        // Fetch festivals
        const { data: festivals, error: festivalsError } = await supabase
          .from('festivals')
          .select('id');
        
        // Fetch tournaments
        const { data: tournaments, error: tournamentsError } = await supabase
          .from('tournaments')
          .select('id');

        // Calculate player stats
        const playerMinutes = new Map<string, { minutes: number, games: Set<string> }>();
        
        if (playerPositions) {
          playerPositions.forEach(position => {
            const playerId = position.player_id;
            const fixtureId = position.fixture_id;
            const minutes = position.fixture_playing_periods?.duration_minutes || 0;
            
            if (!playerMinutes.has(playerId)) {
              playerMinutes.set(playerId, { minutes: 0, games: new Set() });
            }
            
            const playerData = playerMinutes.get(playerId)!;
            playerData.minutes += minutes;
            playerData.games.add(fixtureId);
          });
        }
        
        // Create player stats array
        const playerStatsData = players?.map(player => {
          const minutesData = playerMinutes.get(player.id) || { minutes: 0, games: new Set() };
          
          return {
            id: player.id,
            name: player.name,
            squad_number: player.squad_number,
            games_played: minutesData.games.size,
            minutes_played: minutesData.minutes,
            // These would ideally come from the database, but we're using placeholders
            goals: 0,
            assists: 0,
            motm: 0
          };
        }).sort((a, b) => b.minutes_played - a.minutes_played) || [];
        
        setPlayerStats(playerStatsData);
        
        // Find players with most games and minutes
        let mostGamesPlayer: {name: string, games: number} | undefined;
        let mostMinutesPlayer: {name: string, minutes: number} | undefined;
        
        if (playerStatsData.length > 0) {
          mostGamesPlayer = {
            name: playerStatsData.reduce((max, p) => p.games_played > max.games_played ? p : max, playerStatsData[0]).name,
            games: playerStatsData.reduce((max, p) => p.games_played > max.games_played ? p : max, playerStatsData[0]).games_played
          };
          
          mostMinutesPlayer = {
            name: playerStatsData.reduce((max, p) => p.minutes_played > max.minutes_played ? p : max, playerStatsData[0]).name,
            minutes: playerStatsData.reduce((max, p) => p.minutes_played > max.minutes_played ? p : max, playerStatsData[0]).minutes_played
          };
        }

        // Calculate team stats
        const totalPlayers = players?.length || 0;
        const totalMinutesPlayed = Array.from(playerMinutes.values()).reduce((sum, data) => sum + data.minutes, 0);
        const totalGames = fixtures?.length || 0;
        const playersWithoutMinutes = playerStatsData.filter(p => p.minutes_played === 0).length;
        const averageMinutesPerPlayer = totalPlayers > 0 ? Math.round(totalMinutesPlayed / totalPlayers) : 0;

        setTeamStats({
          totalPlayers,
          totalMinutesPlayed,
          totalGames,
          trainingSessions: sessions?.filter(s => s.type === 'TRAINING').length || 0,
          festivals: festivals?.length || 0,
          tournaments: tournaments?.length || 0,
          playersWithoutMinutes,
          averageMinutesPerPlayer,
          mostGamesPlayer,
          mostMinutesPlayer
        });

      } catch (error: any) {
        console.error("Error fetching team data:", error);
        setError(error.message || "Failed to load team data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{teamName || 'Team Dashboard'}</h1>
          <p className="text-muted-foreground">Squad performance and statistics overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/squad-management">
              <Users className="mr-2 h-4 w-4" />
              Full Squad
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/calendar">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Squad Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{teamStats.totalPlayers}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : (
                `${teamStats.playersWithoutMinutes} players without minutes`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <FileChart className="mr-2 h-5 w-5 text-primary" />
              Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{teamStats.totalGames}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : (
                `${teamStats.festivals} festivals, ${teamStats.tournaments} tournaments`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Total Minutes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{teamStats.totalMinutesPlayed}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? (
                <Skeleton className="h-4 w-36" />
              ) : (
                `${teamStats.averageMinutesPerPlayer} minutes per player avg.`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <BarChart2 className="mr-2 h-5 w-5 text-primary" />
              Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold">{teamStats.trainingSessions}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Training sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-5 w-5 text-primary" />
              Most Games Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold truncate">
                  {teamStats.mostGamesPlayer?.name || "N/A"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {teamStats.mostGamesPlayer ? `${teamStats.mostGamesPlayer.games} games played` : "No games data"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg">
              <Award className="mr-2 h-5 w-5 text-primary" />
              Most Minutes Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <>
                <div className="text-2xl font-bold truncate">
                  {teamStats.mostMinutesPlayer?.name || "N/A"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {teamStats.mostMinutesPlayer ? `${teamStats.mostMinutesPlayer.minutes} minutes played` : "No minutes data"}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="minutes" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="minutes">Minutes Played</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="all">All Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="minutes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Minutes by Player</CardTitle>
              <CardDescription>
                Total minutes played by each squad member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))
              ) : playerStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Minutes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerStats.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium w-16">
                          {player.squad_number || "-"}
                        </TableCell>
                        <TableCell>
                          <Link to={`/player/${player.id}`} className="hover:underline">
                            {player.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          {player.minutes_played}
                          {player.minutes_played === 0 && (
                            <Badge variant="outline" className="ml-2 bg-red-50 text-red-500">
                              0 mins
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No player data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Games by Player</CardTitle>
              <CardDescription>
                Total games played by each squad member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2 mb-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))
              ) : playerStats.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No.</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Games</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...playerStats].sort((a, b) => b.games_played - a.games_played).map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium w-16">
                          {player.squad_number || "-"}
                        </TableCell>
                        <TableCell>
                          <Link to={`/player/${player.id}`} className="hover:underline">
                            {player.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right">
                          {player.games_played}
                          {player.games_played === 0 && (
                            <Badge variant="outline" className="ml-2 bg-red-50 text-red-500">
                              0 games
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No player data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Full Squad Statistics</CardTitle>
              <CardDescription>
                Complete statistics for all squad members
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {isLoading ? (
                <div className="px-6">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-2 mb-4">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : playerStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead className="text-right">Games</TableHead>
                        <TableHead className="text-right">Minutes</TableHead>
                        <TableHead className="text-right">Avg Mins/Game</TableHead>
                        <TableHead className="text-center">View Profile</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerStats.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">
                            {player.squad_number || "-"}
                          </TableCell>
                          <TableCell>{player.name}</TableCell>
                          <TableCell className="text-right">{player.games_played}</TableCell>
                          <TableCell className="text-right">{player.minutes_played}</TableCell>
                          <TableCell className="text-right">
                            {player.games_played > 0 ? Math.round(player.minutes_played / player.games_played) : 0}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/player/${player.id}`}>Details</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No player data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link to="/analytics">
            <BarChart2 className="mr-2 h-4 w-4" />
            View Full Analytics
          </Link>
        </Button>
      </div>
    </div>
  );
};
