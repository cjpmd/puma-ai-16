
import { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, Users } from "lucide-react";

interface UserAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onSuccess: () => void;
}

export const UserAssignmentDialog = ({ open, onOpenChange, user, onSuccess }: UserAssignmentDialogProps) => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<string | null>(user?.club_id || null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(user?.team_id || null);
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [isClubOnly, setIsClubOnly] = useState<boolean>(user?.team_id ? false : true);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Fetch clubs and teams data
  useEffect(() => {
    if (open) {
      fetchClubsAndTeams();
    }
  }, [open]);

  // Filter teams based on selected club
  useEffect(() => {
    if (selectedClub && selectedClub !== 'no-club') {
      const teamsInClub = teams.filter(team => team.club_id === selectedClub);
      setFilteredTeams(teamsInClub);
      
      // If the previously selected team is not in this club, clear it
      if (selectedTeam && !teamsInClub.some(team => team.id === selectedTeam)) {
        setSelectedTeam(null);
      }
    } else {
      setFilteredTeams([]);
      setSelectedTeam(null);
    }
  }, [selectedClub, teams]);

  // Handle club-only toggle
  useEffect(() => {
    if (isClubOnly) {
      setSelectedTeam(null);
    }
  }, [isClubOnly]);

  const fetchClubsAndTeams = async () => {
    setLoading(true);
    try {
      // Fetch clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
        
      if (clubsError) throw clubsError;
      setClubs(clubsData || []);
      console.log("Clubs loaded:", clubsData);
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('team_name');
        
      if (teamsError) throw teamsError;
      
      // Get team_settings to get the custom team names
      const { data: teamSettings, error: settingsError } = await supabase
        .from('team_settings')
        .select('*');
        
      if (settingsError) {
        console.error('Error fetching team settings:', settingsError);
      }
      
      // Fetch admin profiles to help match team settings with teams
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      // Merge team data with custom team names from team_settings
      const teamsWithCustomNames = teamsData.map(team => {
        // Find the admin profile for this team
        const adminProfile = profiles?.find(profile => profile.id === team.admin_id);
        
        // Look for custom team name in team_settings based on admin_id
        const teamSetting = teamSettings?.find(setting => {
          const teamAdmin = adminProfile?.id;
          return teamAdmin === team.admin_id || setting.team_id === team.id;
        });
        
        // Use custom team name if found, otherwise use default team name
        const displayTeamName = teamSetting?.team_name || team.team_name;
        
        return {
          ...team,
          display_team_name: displayTeamName  // Add this field for display purposes
        };
      });
      
      setTeams(teamsWithCustomNames || []);
      console.log("Teams loaded:", teamsWithCustomNames);
      
      // Set initial values based on the user's current assignments
      if (user) {
        console.log("Setting initial values for user:", user.id);
        
        // Get the user's current team assignment
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('team_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (playerError) {
          console.error('Error fetching player data:', playerError);
        }
        
        // Get the user's profile for club_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('club_id')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching profile data:', profileError);
        }
        
        if (playerData && playerData.team_id) {
          console.log("Player has team assignment:", playerData.team_id);
          setSelectedTeam(playerData.team_id);
          setIsClubOnly(false);
          
          // Find the team to get club_id
          const team = teamsWithCustomNames.find(t => t.id === playerData.team_id);
          if (team) {
            console.log("Setting selected club from team:", team.club_id);
            setSelectedClub(team.club_id);
          }
        } else if (profileData && profileData.club_id) {
          console.log("User has club assignment:", profileData.club_id);
          setSelectedClub(profileData.club_id);
          setIsClubOnly(true);
        }
      }
      
    } catch (error) {
      console.error('Error fetching clubs and teams:', error);
      toast({
        title: "Error",
        description: "Failed to load clubs and teams data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!user?.id) {
      console.error("No user ID provided for assignment");
      return;
    }
    
    setSaving(true);
    try {
      console.log("Starting user assignment update...");
      console.log("User ID:", user.id);
      console.log("Selected club:", selectedClub);
      console.log("Selected team:", selectedTeam);
      console.log("Is club only:", isClubOnly);
      
      // First, check if the profiles table has the club_id column
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: 'profiles' });
      
      if (columnsError) {
        console.error("Error checking table columns:", columnsError);
        throw columnsError;
      }
      
      // If club_id doesn't exist in profiles table, we need to add it first
      const hasClubIdColumn = columns.some((column: any) => column.column_name === 'club_id');
      
      if (!hasClubIdColumn) {
        console.log("club_id column doesn't exist, attempting to add it...");
        // Try to execute the SQL function to add the column
        const { error: addColumnError } = await supabase
          .rpc('add_column_if_not_exists', { 
            p_table_name: 'profiles', 
            p_column_name: 'club_id', 
            p_column_def: 'uuid references clubs(id)' 
          });
          
        if (addColumnError) {
          console.error("Error adding club_id column:", addColumnError);
          throw new Error("Failed to add club_id column to profiles. Please contact support to update your database schema.");
        }
        
        console.log("club_id column added successfully");
      }
      
      // Determine club_id to save (null if "no-club" is selected)
      const clubIdToSave = selectedClub === 'no-club' ? null : selectedClub;
      console.log("Club ID to save:", clubIdToSave);
      
      // Update the user's profile with club association
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ club_id: clubIdToSave })
        .eq('id', user.id);
        
      if (profileUpdateError) {
        console.error("Error updating profile:", profileUpdateError);
        throw profileUpdateError;
      }
      
      console.log("Profile updated successfully with club_id");
      
      // Handle player assignment to team
      if (!isClubOnly && selectedTeam && selectedTeam !== 'no-team') {
        console.log("Assigning user to team:", selectedTeam);
        
        // Check if player record exists
        const { data: existingPlayer, error: playerCheckError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (playerCheckError) {
          console.error("Error checking if player exists:", playerCheckError);
          throw playerCheckError;
        }
        
        if (existingPlayer) {
          // If the player is being transferred to a different team, record the transfer
          if (existingPlayer.team_id && existingPlayer.team_id !== selectedTeam) {
            // Record the transfer in a player_transfers table if it exists
            try {
              // First check if the player_transfers table exists
              const { data: tableExists } = await supabase
                .from('player_transfers')
                .select('id')
                .limit(1);
                
              // If the table exists, record the transfer
              if (tableExists !== null) {
                await supabase
                  .from('player_transfers')
                  .insert({
                    player_id: existingPlayer.id,
                    from_team_id: existingPlayer.team_id,
                    to_team_id: selectedTeam,
                    transfer_date: new Date().toISOString(),
                    status: 'completed',
                    type: 'transfer'
                  });
                  
                console.log("Player transfer record created");
              }
            } catch (transferError) {
              // If the table doesn't exist, just log and continue
              console.log("player_transfers table doesn't exist, skipping transfer record");
            }
          }
          
          // Update existing player record
          console.log("Updating existing player record");
          const { error: playerUpdateError } = await supabase
            .from('players')
            .update({ team_id: selectedTeam, status: 'active' })
            .eq('id', existingPlayer.id);
            
          if (playerUpdateError) {
            console.error("Error updating player:", playerUpdateError);
            throw playerUpdateError;
          }
        } else {
          // Create new player record
          console.log("Creating new player record");
          const { error: playerCreateError } = await supabase
            .from('players')
            .insert({
              user_id: user.id,
              team_id: selectedTeam,
              name: user.name || user.email,
              status: 'active'
            });
            
          if (playerCreateError) {
            console.error("Error creating player:", playerCreateError);
            throw playerCreateError;
          }
        }
        
        console.log("Player record updated successfully");
      } else if (isClubOnly || selectedTeam === 'no-team') {
        // Remove team assignment if club-only or no team selected
        const { data: existingPlayer, error: playerCheckError } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (playerCheckError) {
          console.error("Error checking player record:", playerCheckError);
          throw playerCheckError;
        }
        
        if (existingPlayer) {
          console.log("Removing team assignment from player");
          const { error: playerRemoveError } = await supabase
            .from('players')
            .update({ team_id: null })
            .eq('id', existingPlayer.id);
            
          if (playerRemoveError) {
            console.error("Error removing team assignment:", playerRemoveError);
            throw playerRemoveError;
          }
          
          console.log("Team assignment removed successfully");
        }
      }
      
      toast({
        title: "Success",
        description: "User assignments updated successfully",
      });
      
      onSuccess(); // Refresh parent component data
      onOpenChange(false); // Close dialog
    } catch (error: any) {
      console.error('Error updating user assignments:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user assignments",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign User</DialogTitle>
          <DialogDescription>
            Assign {user?.name || 'user'} to a club and/or team
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <Label htmlFor="club">Club Assignment</Label>
              </div>
              <Select
                value={selectedClub || undefined}
                onValueChange={(value) => setSelectedClub(value || null)}
              >
                <SelectTrigger id="club" className="w-full">
                  <SelectValue placeholder="Select a club" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-club">No Club</SelectItem>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedClub && selectedClub !== 'no-club' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="club-only" 
                    checked={isClubOnly}
                    onCheckedChange={(checked) => setIsClubOnly(checked as boolean)}
                  />
                  <Label htmlFor="club-only">
                    Club-only role (not assigned to any team)
                  </Label>
                </div>
                
                {!isClubOnly && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <Label htmlFor="team">Team Assignment</Label>
                    </div>
                    <Select
                      value={selectedTeam || undefined}
                      onValueChange={(value) => setSelectedTeam(value || null)}
                      disabled={filteredTeams.length === 0}
                    >
                      <SelectTrigger id="team" className="w-full">
                        <SelectValue placeholder={
                          filteredTeams.length === 0 
                            ? "No teams in this club" 
                            : "Select a team"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-team">No Team</SelectItem>
                        {filteredTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.display_team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAssignment} disabled={saving || loading}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Assignments
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
