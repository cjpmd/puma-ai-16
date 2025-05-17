import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Loader2, MoreVertical, Search, UserPlus, Shield, Building, Users } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/hooks/useAuth';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  last_sign_in_at?: string;
  created_at: string;
  team_id?: string;
  team_name?: string;
  club_id?: string;
  club_name?: string;
}

interface Club {
  id: string;
  name: string;
  teams: Team[];
}

interface Team {
  id: string;
  name: string;
  users: User[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clubsWithTeams, setClubsWithTeams] = useState<Club[]>([]);
  const [filterView, setFilterView] = useState<'all' | 'organized'>('organized');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersClubsAndTeams();
  }, []);

  const fetchUsersClubsAndTeams = async () => {
    setLoading(true);
    try {
      console.log('Fetching users, clubs, and teams data for global admin...');
      
      // Fetch clubs
      const { data: clubs, error: clubsError } = await supabase
        .from('clubs')
        .select('id, name');
        
      if (clubsError) {
        console.error('Error fetching clubs:', clubsError);
        throw clubsError;
      }
      
      console.log('Clubs data:', clubs);

      // Fetch teams with club associations
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, team_name, club_id, admin_id');
        
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        throw teamsError;
      }
      
      console.log('Teams data:', teams);

      // First get auth users
      // Using non-admin API as the admin API might not be available for all users
      let authUsers;
      try {
        const { data, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) {
          console.warn('Admin API not available, fetching current user only:', authError);
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user) {
            authUsers = { users: [sessionData.session.user] };
          }
        } else {
          authUsers = data;
        }
      } catch (error) {
        console.warn('Error with auth.admin.listUsers, trying alternative method:', error);
        // Fallback to fetching profiles directly
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          authUsers = { users: [sessionData.session.user] };
        }
      }
      
      console.log('Auth users fetched:', authUsers?.users?.length);

      // Then get profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Profiles data:', profiles);

      // Get player-team relationships
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, user_id, team_id');
        
      if (playersError) {
        console.error('Error fetching players:', playersError);
        throw playersError;
      }
      
      console.log('Players data:', players);

      // Merge the data to create comprehensive user objects
      let mergedUsers: User[] = [];
      
      if (authUsers?.users) {
        mergedUsers = authUsers.users.map(user => {
          const profile = profiles?.find(p => p.id === user.id);
          const player = players?.find(p => p.user_id === user.id);
          const playerTeam = player ? teams?.find(t => t.id === player.team_id) : null;
          const adminTeam = teams?.find(t => t.admin_id === user.id);
          const team = playerTeam || adminTeam;
          
          const clubId = team?.club_id;
          const club = clubs?.find(c => c.id === clubId);
          
          return {
            id: user.id,
            email: user.email || 'No Email',
            role: profile?.role || 'user',
            name: profile?.name || user.email?.split('@')[0] || 'Unknown',
            last_sign_in_at: user.last_sign_in_at,
            created_at: user.created_at,
            team_id: team?.id,
            team_name: team?.team_name || 'No Team',
            club_id: clubId,
            club_name: club?.name || 'No Club'
          };
        });
      } else if (profiles) {
        // If we couldn't fetch auth users, build from profiles
        mergedUsers = profiles.map(profile => {
          const player = players?.find(p => p.user_id === profile.id);
          const playerTeam = player ? teams?.find(t => t.id === player.team_id) : null;
          const adminTeam = teams?.find(t => t.admin_id === profile.id);
          const team = playerTeam || adminTeam;
          
          const clubId = team?.club_id;
          const club = clubs?.find(c => c.id === clubId);
          
          return {
            id: profile.id,
            email: profile.email || 'No Email',
            role: profile.role || 'user',
            name: profile.name || 'Unknown',
            last_sign_in_at: null,
            created_at: profile.created_at || new Date().toISOString(),
            team_id: team?.id,
            team_name: team?.team_name || 'No Team',
            club_id: clubId,
            club_name: club?.name || 'No Club'
          };
        });
      }
      
      console.log('Merged users:', mergedUsers.length);
      setUsers(mergedUsers);

      // Organize users by club and team
      const organizedClubs: Club[] = [];
      
      // First collect all clubs
      clubs?.forEach(club => {
        organizedClubs.push({
          id: club.id,
          name: club.name,
          teams: []
        });
      });
      
      // Add "No Club" category
      organizedClubs.push({
        id: 'no-club',
        name: 'No Club',
        teams: []
      });
      
      // Add teams to their clubs
      teams?.forEach(team => {
        const clubIndex = team.club_id 
          ? organizedClubs.findIndex(c => c.id === team.club_id)
          : organizedClubs.findIndex(c => c.id === 'no-club');
          
        if (clubIndex !== -1) {
          organizedClubs[clubIndex].teams.push({
            id: team.id,
            name: team.team_name,
            users: []
          });
        }
      });
      
      // Add "No Team" category to each club
      organizedClubs.forEach(club => {
        club.teams.push({
          id: `${club.id}-no-team`,
          name: 'No Team',
          users: []
        });
      });
      
      // Assign users to their teams
      mergedUsers.forEach(user => {
        const clubIndex = user.club_id 
          ? organizedClubs.findIndex(c => c.id === user.club_id)
          : organizedClubs.findIndex(c => c.id === 'no-club');
          
        if (clubIndex !== -1) {
          const teamIndex = user.team_id
            ? organizedClubs[clubIndex].teams.findIndex(t => t.id === user.team_id)
            : organizedClubs[clubIndex].teams.findIndex(t => t.id === `${user.club_id}-no-team`);
            
          if (teamIndex !== -1) {
            organizedClubs[clubIndex].teams[teamIndex].users.push(user);
          } else {
            // If team not found, add to "No Team"
            const noTeamIndex = organizedClubs[clubIndex].teams.findIndex(t => t.id === `${organizedClubs[clubIndex].id}-no-team`);
            if (noTeamIndex !== -1) {
              organizedClubs[clubIndex].teams[noTeamIndex].users.push(user);
            }
          }
        } else {
          // If club not found, add to "No Club" -> "No Team"
          const noClubIndex = organizedClubs.findIndex(c => c.id === 'no-club');
          if (noClubIndex !== -1) {
            const noTeamIndex = organizedClubs[noClubIndex].teams.findIndex(t => t.id === 'no-club-no-team');
            if (noTeamIndex !== -1) {
              organizedClubs[noClubIndex].teams[noTeamIndex].users.push(user);
            }
          }
        }
      });
      
      // Clean up by removing empty clubs and teams
      const filteredClubs = organizedClubs
        .filter(club => club.teams.some(team => team.users.length > 0))
        .map(club => ({
          ...club,
          teams: club.teams.filter(team => team.users.length > 0)
        }));
      
      console.log('Organized clubs with teams:', filteredClubs.length);
      setClubsWithTeams(filteredClubs);
    } catch (error) {
      console.error('Error fetching users and organizations:', error);
      toast({
        title: "Error fetching data",
        description: "There was a problem loading the user data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update local state for both views
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // Update organized view
      const updatedClubs = clubsWithTeams.map(club => ({
        ...club,
        teams: club.teams.map(team => ({
          ...team,
          users: team.users.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          )
        }))
      }));
      
      setClubsWithTeams(updatedClubs);

      toast({
        title: "Role updated",
        description: `User role successfully updated to ${newRole}.`,
      });
      
      // If the user is in the dialog, update the selected user too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error updating role",
        description: "There was a problem updating the user role.",
        variant: "destructive"
      });
    }
  };

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.club_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter clubs and teams based on search
  const filteredClubs = clubsWithTeams.map(club => {
    // First check if club name matches
    const clubMatches = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Then filter teams
    const filteredTeams = club.teams.map(team => {
      // Check if team name matches
      const teamMatches = team.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter users in this team
      const filteredTeamUsers = team.users.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // Return team with filtered users
      return {
        ...team,
        users: teamMatches ? team.users : filteredTeamUsers
      };
    }).filter(team => team.users.length > 0);
    
    // Return club with filtered teams
    return {
      ...club,
      teams: clubMatches ? club.teams : filteredTeams
    };
  }).filter(club => club.teams.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-2/3">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users, teams, clubs..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={filterView} onValueChange={(value: 'all' | 'organized') => setFilterView(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="View Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="organized">Organized View</SelectItem>
              <SelectItem value="all">List View</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filterView === 'organized' ? (
        <div className="border rounded-md">
          <Accordion type="multiple" className="w-full">
            {filteredClubs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredClubs.map((club) => (
                <AccordionItem value={club.id} key={club.id}>
                  <AccordionTrigger className="px-4 hover:bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium">{club.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {club.teams.reduce((count, team) => count + team.users.length, 0)} users
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-4 pr-0">
                      <Accordion type="multiple" className="w-full">
                        {club.teams.map((team) => (
                          <AccordionItem value={team.id} key={team.id}>
                            <AccordionTrigger className="px-4 hover:bg-muted/20">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="font-medium">{team.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {team.users.length} users
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="rounded-md">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Email</TableHead>
                                      <TableHead>Role</TableHead>
                                      <TableHead>Last Sign In</TableHead>
                                      <TableHead className="w-[80px]">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {team.users.map((user) => (
                                      <TableRow 
                                        key={user.id} 
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => handleViewUserDetails(user)}
                                      >
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                          <div className="flex items-center">
                                            <Shield className="mr-2 h-4 w-4 text-primary" />
                                            <span className="capitalize">{user.role}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
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
                                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'admin'); }}>
                                                Make Admin
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'coach'); }}>
                                                Make Coach
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'parent'); }}>
                                                Make Parent
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'player'); }}>
                                                Make Player
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'globalAdmin'); }}>
                                                Make Global Admin
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </div>
      ) : (
        // List view (original table)
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Club</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewUserDetails(user)}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-primary" />
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.team_name}</TableCell>
                    <TableCell>{user.club_name}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
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
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'admin'); }}>
                            Make Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'coach'); }}>
                            Make Coach
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'parent'); }}>
                            Make Parent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'player'); }}>
                            Make Player
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'globalAdmin'); }}>
                            Make Global Admin
                          </DropdownMenuItem>
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
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View and manage user information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">ID:</div>
                <div className="col-span-3">{selectedUser.id}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Name:</div>
                <div className="col-span-3">{selectedUser.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Email:</div>
                <div className="col-span-3">{selectedUser.email}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Role:</div>
                <div className="col-span-3 capitalize">{selectedUser.role}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Team:</div>
                <div className="col-span-3">{selectedUser.team_name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Club:</div>
                <div className="col-span-3">{selectedUser.club_name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Created:</div>
                <div className="col-span-3">{new Date(selectedUser.created_at).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Last Login:</div>
                <div className="col-span-3">{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleString() : 'Never'}</div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            <Button>Update User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
