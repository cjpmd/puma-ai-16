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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Search, MoreVertical, Filter, UserPlus, Users } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole, useAuth } from '@/hooks/useAuth';
import { useTeams } from '@/contexts/TeamContext';
import { UserAssignmentDialog } from '@/components/admin/UserAssignmentDialog';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  last_sign_in_at?: string;
  created_at: string;
  team_id?: string;
  team_name?: string;
  club_id?: string;
  club_name?: string;
}

export const TeamUsersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterClub, setFilterClub] = useState<string>('all');
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [userToAssign, setUserToAssign] = useState<User | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();
  const { currentTeam } = useTeams();

  useEffect(() => {
    fetchUsersAndTeams();
  }, [profile, currentTeam]);

  const fetchUsersAndTeams = async () => {
    setLoading(true);
    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('id, team_name, club_id');
        
      if (teamsError) throw teamsError;
      setTeams(teamsData || []);
      
      // Fetch clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('id, name');
        
      if (clubsError) throw clubsError;
      setClubs(clubsData || []);
      
      // For global admin, fetch all users
      // For regular admin, only fetch users for their team
      const isGlobalAdmin = profile?.role === 'globalAdmin';
      
      // Fetch auth users and profiles
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        throw profilesError;
      }

      // Get player-team relationships
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, user_id, team_id');
        
      if (playersError) throw playersError;
      
      // Map clubs to teams
      const teamWithClub = teamsData?.map(team => {
        const club = clubsData?.find(club => club.id === team.club_id);
        return {
          ...team,
          club_name: club?.name || 'No Club'
        };
      });

      // Merge the data to create a comprehensive user list
      const mergedUsers = authUsers?.users?.map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        const player = players?.find(p => p.user_id === user.id);
        const team = player ? teamWithClub?.find(t => t.id === player.team_id) : null;
        
        return {
          id: user.id,
          email: user.email || 'No Email',
          role: profile?.role || 'user',
          name: profile?.name || user.email?.split('@')[0] || 'Unknown',
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at,
          team_id: team?.id || null,
          team_name: team?.team_name || 'No Team',
          club_id: team?.club_id || null,
          club_name: team?.club_name || 'No Club'
        };
      }) || [];

      // Filter users based on role
      let filteredUsers = mergedUsers;
      
      if (!isGlobalAdmin && currentTeam) {
        // For regular admin, only show users from their current team
        filteredUsers = mergedUsers.filter(user => user.team_id === currentTeam.id);
      }

      setUsers(filteredUsers);
      
      // Set default filters based on role
      if (!isGlobalAdmin && currentTeam) {
        setFilterTeam(currentTeam.id);
      }
      
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
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

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Role updated",
        description: `User role successfully updated to ${newRole}.`,
      });
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

  const handleAssignUser = (user: User) => {
    setUserToAssign(user);
    setAssignUserDialogOpen(true);
  };

  // Apply filters and search to users
  const filteredUsers = users.filter(user => {
    // Apply search
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.club_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply filters - for regular admin, team filter is already applied during data fetch
    const matchesTeam = filterTeam === 'all' || user.team_id === filterTeam;
    const matchesClub = filterClub === 'all' || user.club_id === filterClub;
    
    // For global admin, apply all filters
    if (profile?.role === 'globalAdmin') {
      return matchesSearch && matchesTeam && matchesClub;
    }
    
    // For regular admin, only apply search filter as team is already filtered
    return matchesSearch;
  });

  // Should we show filter options?
  const showFilters = profile?.role === 'globalAdmin';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {profile?.role === 'globalAdmin' ? 'Platform Users' : 'Team Users'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {showFilters && (
              <>
                <Select value={filterClub} onValueChange={setFilterClub}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Club" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clubs</SelectItem>
                    {clubs.map(club => (
                      <SelectItem key={club.id} value={club.id}>{club.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={filterTeam} onValueChange={setFilterTeam}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.team_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Team</TableHead>
                  {profile?.role === 'globalAdmin' && <TableHead>Club</TableHead>}
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={profile?.role === 'globalAdmin' ? 7 : 6} className="text-center py-4 text-muted-foreground">
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
                      {profile?.role === 'globalAdmin' && <TableCell>{user.club_name}</TableCell>}
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAssignUser(user); }}>
                              Assign to Club/Team
                            </DropdownMenuItem>
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
                            {profile?.role === 'globalAdmin' && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleChangeRole(user.id, 'globalAdmin'); }}>
                                Make Global Admin
                              </DropdownMenuItem>
                            )}
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
              <Button onClick={() => {
                setDialogOpen(false);
                if (selectedUser) handleAssignUser(selectedUser);
              }}>
                Assign to Club/Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add the user assignment dialog */}
        {userToAssign && (
          <UserAssignmentDialog 
            open={assignUserDialogOpen}
            onOpenChange={setAssignUserDialogOpen}
            user={userToAssign}
            onSuccess={fetchUsersAndTeams}
          />
        )}
      </CardContent>
    </Card>
  );
};
