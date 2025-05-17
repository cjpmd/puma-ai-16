
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Loader2, Search, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const TeamManagement = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      // Get teams data
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('team_name');
        
      if (teamsError) throw teamsError;
      
      // Get team_settings to get the custom team names
      const { data: teamSettings, error: settingsError } = await supabase
        .from('team_settings')
        .select('*');
        
      if (settingsError) console.error('Error fetching team settings:', settingsError);
      
      // Now fetch admin profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Manual join with team_settings to get the custom team name
      const teamsWithAdmins = teamsData.map(team => {
        const adminProfile = profiles.find(profile => profile.id === team.admin_id);
        
        // Look for custom team name in team_settings
        const teamSetting = teamSettings?.find(setting => {
          // Try to match by admin_id since team_settings might not have a direct link to teams table
          const teamAdmin = adminProfile?.id;
          return teamAdmin === team.admin_id;
        });
        
        // Use custom team name if found, otherwise use default team name
        const displayTeamName = teamSetting?.team_name || team.team_name;
        
        return {
          ...team,
          display_team_name: displayTeamName, // Add this field for display purposes
          profiles: adminProfile ? {
            name: adminProfile.name || 'Unknown',
            email: adminProfile.email || 'No email'
          } : null
        };
      });

      // Get player count for each team
      const teamsWithPlayerCounts = await Promise.all(teamsWithAdmins.map(async (team) => {
        try {
          const { count, error: countError } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id);
            
          if (countError) throw countError;
          
          return {
            ...team,
            playerCount: count || 0
          };
        } catch (countErr) {
          console.error(`Error getting player count for team ${team.id}:`, countErr);
          return {
            ...team,
            playerCount: 0
          };
        }
      }));
      
      console.log('Teams with custom names:', teamsWithPlayerCounts);
      setTeams(teamsWithPlayerCounts);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error fetching teams",
        description: "There was a problem loading the team data.",
        variant: "destructive"
      });
      setTeams([]); // Set empty array on error to avoid undefined issues
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeamDetails = (team: any) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };

  const filteredTeams = teams.filter(team => 
    team.display_team_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    team.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          Add New Team
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No teams found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeams.map((team) => (
                  <TableRow key={team.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewTeamDetails(team)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {team.team_logo ? (
                            <AvatarImage src={team.team_logo} alt={team.display_team_name} />
                          ) : (
                            <AvatarFallback>{team.display_team_name?.charAt(0) || 'T'}</AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">{team.display_team_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{team.profiles?.name || 'Unknown'}</TableCell>
                    <TableCell>{team.age_group || 'N/A'}</TableCell>
                    <TableCell>{team.playerCount}</TableCell>
                    <TableCell>
                      {new Date(team.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={team.subscription_active ? "default" : "outline"}>
                        {team.subscription_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Team</DropdownMenuItem>
                          <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                          <DropdownMenuItem>View Players</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Team</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Team Details</DialogTitle>
            <DialogDescription>
              View and manage team information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeam && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Team Name:</div>
                <div className="col-span-3">{selectedTeam.display_team_name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Admin:</div>
                <div className="col-span-3">{selectedTeam.profiles?.name || 'Unknown'} ({selectedTeam.profiles?.email || 'No email'})</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Age Group:</div>
                <div className="col-span-3">{selectedTeam.age_group || 'Not specified'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Players:</div>
                <div className="col-span-3">{selectedTeam.playerCount} registered</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Created:</div>
                <div className="col-span-3">{new Date(selectedTeam.created_at).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Subscription:</div>
                <div className="col-span-3">
                  <Badge variant={selectedTeam.subscription_active ? "default" : "outline"}>
                    {selectedTeam.subscription_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            <Button>Edit Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
