
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ClubSubscriptionReport } from "@/components/clubs/ClubSubscriptionReport";
import { Settings, CreditCard, Users } from "lucide-react";

export default function ClubSettings() {
  const [club, setClub] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    const fetchClubData = async () => {
      if (!profile) return;
      
      try {
        setLoading(true);
        
        // Check if user has a club
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();
          
        if (clubError) {
          console.error('Error fetching club:', clubError);
          return;
        }
        
        if (clubData) {
          setClub(clubData);
          
          // Fetch teams in this club
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .eq('club_id', clubData.id);
            
          if (teamsError) {
            console.error('Error fetching teams:', teamsError);
            return;
          }
          
          setTeams(teamsData || []);
        }
      } catch (error) {
        console.error('Error in fetchClubData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClubData();
  }, [profile]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-muted-foreground">Loading club data...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Club Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="mb-4">You don't have a club set up yet.</p>
              <Button onClick={() => navigate("/create-club")}>Create a Club</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{club.name} - Club Settings</h1>
        <Button variant="outline" onClick={() => navigate("/team-settings")}>
          Back to Team Settings
        </Button>
      </div>
      
      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            <span>Club Details</span>
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Teams</span>
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Subscriptions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Club Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Club Name:</strong> {club.name}</p>
                <p><strong>Location:</strong> {club.location || 'Not specified'}</p>
                <p><strong>Contact Email:</strong> {club.contact_email || 'Not specified'}</p>
                <p><strong>Phone:</strong> {club.phone || 'Not specified'}</p>
                <p><strong>Website:</strong> {club.website || 'Not specified'}</p>
                <p><strong>Description:</strong></p>
                <p>{club.description || 'No description available'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Teams in Club</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length > 0 ? (
                <div className="space-y-4">
                  {teams.map(team => (
                    <div key={team.id} className="p-4 border rounded-md">
                      <h3 className="text-lg font-semibold">{team.team_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.age_group ? `Age Group: ${team.age_group}` : 'No age group specified'}
                      </p>
                      <p className="text-sm">
                        {team.location ? `Location: ${team.location}` : 'No location specified'}
                      </p>
                      <p className="text-sm">
                        Joined: {team.joined_club_at 
                          ? new Date(team.joined_club_at).toLocaleDateString() 
                          : 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No teams have joined this club yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <ClubSubscriptionReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
