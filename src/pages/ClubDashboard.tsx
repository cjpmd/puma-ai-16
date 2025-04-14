import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, Clock, Users, BarChart2 } from "lucide-react";

export default function ClubDashboard() {
  const { clubId } = useParams();
  const [club, setClub] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any>({
    totalPlayers: 0,
    byAgeGroup: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClubData = async () => {
      if (!clubId) return;
      
      try {
        // Fetch club details
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('id', clubId)
          .single();
          
        if (clubError) throw clubError;
        setClub(clubData);
        
        // Fetch teams in this club
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('club_id', clubId);
          
        if (teamsError) throw teamsError;
        setTeams(teamsData || []);
        
        // Calculate player statistics
        if (teamsData && teamsData.length > 0) {
          const teamIds = teamsData.map(team => team.id);
          
          // Get all players from these teams
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('*, teams!inner(*)')
            .in('team_id', teamIds);
            
          if (playersError) throw playersError;
          
          // Process player statistics
          const stats = {
            totalPlayers: playersData?.length || 0,
            byAgeGroup: {} as Record<string, number>,
          };
          
          playersData?.forEach(player => {
            const team = teamsData.find(t => t.id === player.team_id);
            if (team) {
              if (!stats.byAgeGroup[team.age_group]) {
                stats.byAgeGroup[team.age_group] = 0;
              }
              stats.byAgeGroup[team.age_group]++;
            }
          });
          
          setPlayerStats(stats);
        }
      } catch (err) {
        console.error("Error fetching club data:", err);
        setError("Failed to load club data");
        toast({
          title: "Error",
          description: "Failed to load club data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClubData();
  }, [clubId, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-[80vh]">
        <div className="animate-pulse text-primary">Loading club data...</div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error || "Club not found"}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Button variant="outline" className="mb-2" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-muted-foreground">{club.location}</p>
        </div>
        
        <Button onClick={() => navigate(`/club-settings`)}>
          Manage Club
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Total Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Total Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{playerStats.totalPlayers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Teams</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="playing-time" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Playing Time</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Club Teams</CardTitle>
              <CardDescription>
                Teams associated with {club.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map(team => (
                    <Card key={team.id} className="overflow-hidden">
                      <div 
                        className="h-2" 
                        style={{ backgroundColor: team.team_color || '#0f172a' }}
                      ></div>
                      <CardContent className="pt-4">
                        <h3 className="font-bold text-lg mb-1">{team.team_name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{team.age_group}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => navigate(`/team/${team.id}`)}
                        >
                          View Team
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No teams have joined this club yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Club Statistics</CardTitle>
              <CardDescription>
                Overview of player statistics across all teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Players by Age Group</h3>
                  {Object.keys(playerStats.byAgeGroup).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(playerStats.byAgeGroup).map(([ageGroup, count]) => (
                        <div key={ageGroup} className="flex items-center">
                          <div className="w-32 font-medium">{ageGroup}</div>
                          <div className="flex-1">
                            <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-primary"
                                style={{ width: `${(Number(count) / playerStats.totalPlayers) * 100}%` }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-end px-3">
                                <span className="text-sm font-medium">{count}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No player data available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="playing-time">
          <Card>
            <CardHeader>
              <CardTitle>Playing Time Analysis</CardTitle>
              <CardDescription>
                Training and match playing time analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Playing time analysis is coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
