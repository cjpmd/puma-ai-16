
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ClubSubscriptionReport } from "@/components/clubs/ClubSubscriptionReport";
import { Settings, CreditCard, Users, ArrowLeft, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NavBar } from "@/components/NavBar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ClubSettings() {
  const [clubs, setClubs] = useState<any[]>([]); 
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClubData = async () => {
      if (!profile) return;
      
      try {
        setLoading(true);
        
        // Check if user has clubs - changed to get all clubs, not just one
        const { data: clubsData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('admin_id', profile.id);
          
        if (clubError) {
          console.error('Error fetching club:', clubError);
          return;
        }
        
        if (clubsData && clubsData.length > 0) {
          setClubs(clubsData);
          setSelectedClub(clubsData[0]); // Select the first club by default
          
          // Fetch teams in this club
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .eq('club_id', clubsData[0].id);
            
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

  const handleClubChange = async (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    if (club) {
      setSelectedClub(club);
      
      // Fetch teams for the selected club
      try {
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('club_id', club.id);
          
        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          return;
        }
        
        setTeams(teamsData || []);
      } catch (error) {
        console.error('Error fetching teams for club:', error);
      }
    }
  };
  
  const handleDeleteClub = async () => {
    if (!selectedClub) return;
    
    try {
      // First update all teams to remove connection to this club
      const { error: teamsError } = await supabase
        .from('teams')
        .update({ 
          club_id: null,
          joined_club_at: null
        })
        .eq('club_id', selectedClub.id);
        
      if (teamsError) {
        console.error('Error removing team connections:', teamsError);
        toast({
          title: "Error",
          description: "Failed to disconnect teams from club",
          variant: "destructive"
        });
        return;
      }
      
      // Then delete the club
      const { error: deleteError } = await supabase
        .from('clubs')
        .delete()
        .eq('id', selectedClub.id);
        
      if (deleteError) {
        console.error('Error deleting club:', deleteError);
        toast({
          title: "Error",
          description: "Failed to delete club",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Success",
        description: `${selectedClub.name} has been deleted`,
      });
      
      // Remove the deleted club from state
      setClubs(prevClubs => prevClubs.filter(c => c.id !== selectedClub.id));
      
      // If we have remaining clubs, select the first one
      if (clubs.length > 1) {
        const remainingClubs = clubs.filter(c => c.id !== selectedClub.id);
        if (remainingClubs.length > 0) {
          setSelectedClub(remainingClubs[0]);
          handleClubChange(remainingClubs[0].id);
        } else {
          // No more clubs, navigate back to team settings
          navigate('/team-settings');
        }
      } else {
        // No more clubs, navigate back to team settings
        navigate('/team-settings');
      }
    } catch (error) {
      console.error('Error in handleDeleteClub:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container mx-auto py-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading club data...</p>
          </div>
        </div>
      </>
    );
  }

  if (clubs.length === 0) {
    return (
      <>
        <NavBar />
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
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {selectedClub?.name} - Club Settings
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/team-settings")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Team Settings
            </Button>
            {clubs.length > 1 && (
              <select 
                className="border rounded px-3 py-2"
                value={selectedClub?.id}
                onChange={(e) => handleClubChange(e.target.value)}
              >
                {clubs.map(club => (
                  <option key={club.id} value={club.id}>{club.name}</option>
                ))}
              </select>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Club</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{selectedClub?.name}" and remove all team associations.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClub}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
                  <p><strong>Club Name:</strong> {selectedClub?.name}</p>
                  <p><strong>Location:</strong> {selectedClub?.location || 'Not specified'}</p>
                  <p><strong>Contact Email:</strong> {selectedClub?.contact_email || 'Not specified'}</p>
                  <p><strong>Phone:</strong> {selectedClub?.phone || 'Not specified'}</p>
                  <p><strong>Website:</strong> {selectedClub?.website || 'Not specified'}</p>
                  <p><strong>Serial Number:</strong> {selectedClub?.serial_number}</p>
                  <p><strong>Description:</strong></p>
                  <p>{selectedClub?.description || 'No description available'}</p>
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
            <ClubSubscriptionReport clubId={selectedClub?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
