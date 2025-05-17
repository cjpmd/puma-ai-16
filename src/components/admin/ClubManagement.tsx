
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
import { Loader2, Search, MoreVertical, Building } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export const ClubManagement = () => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      // Simple approach: just get clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
        
      if (clubsError) throw clubsError;
      
      // Fetch admin profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Manual join
      const clubsWithAdmins = clubsData.map(club => {
        const adminProfile = profiles.find(profile => profile.id === club.admin_id);
        return {
          ...club,
          profiles: adminProfile ? {
            name: adminProfile.name || 'Unknown',
            email: adminProfile.email || 'No email'
          } : null
        };
      });
      
      // Get team counts for each club
      const clubsWithTeamCounts = await Promise.all(clubsWithAdmins.map(async (club) => {
        try {
          const { count: teamCount, error: teamCountError } = await supabase
            .from('teams')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', club.id);
            
          if (teamCountError) throw teamCountError;
          
          return {
            ...club,
            teamCount: teamCount || 0
          };
        } catch (countErr) {
          console.error(`Error getting team count for club ${club.id}:`, countErr);
          return {
            ...club,
            teamCount: 0
          };
        }
      }));
      
      setClubs(clubsWithTeamCounts);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast({
        title: "Error fetching clubs",
        description: "There was a problem loading the club data.",
        variant: "destructive"
      });
      setClubs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewClubDetails = (club: any) => {
    setSelectedClub(club);
    setDialogOpen(true);
  };

  const filteredClubs = clubs.filter(club => 
    club.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    club.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button>
          Add New Club
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
                <TableHead>Club Name</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClubs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No clubs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredClubs.map((club) => (
                  <TableRow key={club.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewClubDetails(club)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <span className="font-medium">{club.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{club.profiles?.name || 'Unknown'}</TableCell>
                    <TableCell>{club.teamCount}</TableCell>
                    <TableCell>{club.location || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(club.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={club.subscription_active ? "default" : "outline"}>
                        {club.subscription_active ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem>Edit Club</DropdownMenuItem>
                          <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                          <DropdownMenuItem>View Teams</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Club</DropdownMenuItem>
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
            <DialogTitle>Club Details</DialogTitle>
            <DialogDescription>
              View and manage club information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClub && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Club Name:</div>
                <div className="col-span-3">{selectedClub.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Admin:</div>
                <div className="col-span-3">{selectedClub.profiles?.name || 'Unknown'} ({selectedClub.profiles?.email || 'No email'})</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Teams:</div>
                <div className="col-span-3">{selectedClub.teamCount} registered</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Location:</div>
                <div className="col-span-3">{selectedClub.location || 'Not specified'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Created:</div>
                <div className="col-span-3">{new Date(selectedClub.created_at).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Subscription:</div>
                <div className="col-span-3">
                  <Badge variant={selectedClub.subscription_active ? "default" : "outline"}>
                    {selectedClub.subscription_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            <Button>Edit Club</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
