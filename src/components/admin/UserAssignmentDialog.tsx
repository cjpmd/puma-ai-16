
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
    if (selectedClub) {
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
          return teamAdmin === team.admin_id;
        });
        
        // Use custom team name if found, otherwise use default team name
        const displayTeamName = teamSetting?.team_name || team.team_name;
        
        return {
          ...team,
          display_team_name: displayTeamName  // Add this field for display purposes
        };
      });
      
      setTeams(teamsWithCustomNames || []);
      
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
    if (!user?.id) return;
    
    setSaving(true);
    try {
      // Update profile with club association
      const profileUpdate = {
        club_id: selectedClub === 'no-club' ? null : selectedClub
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Handle player assignment
      if (!isClubOnly && selectedTeam && selectedTeam !== 'no-team') {
        // Check if player record exists
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (existingPlayer) {
          // Update existing player
          await supabase
            .from('players')
            .update({ team_id: selectedTeam })
            .eq('user_id', user.id);
        } else {
          // Create new player
          await supabase
            .from('players')
            .insert({
              user_id: user.id,
              team_id: selectedTeam
            });
        }
      } else {
        // If club only or no team selected, remove team assignment if exists
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (existingPlayer) {
          await supabase
            .from('players')
            .update({ team_id: null })
            .eq('user_id', user.id);
        }
      }
      
      toast({
        title: "Success",
        description: "User assignments updated successfully",
      });
      
      onSuccess(); // Refresh parent component data
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error('Error updating user assignments:', error);
      toast({
        title: "Error",
        description: "Failed to update user assignments",
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
