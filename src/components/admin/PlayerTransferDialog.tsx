
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from "lucide-react";

interface PlayerTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: any;
  onSuccess: () => void;
}

export const PlayerTransferDialog = ({ 
  open, 
  onOpenChange, 
  player, 
  onSuccess 
}: PlayerTransferDialogProps) => {
  const [clubs, setClubs] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [transferType, setTransferType] = useState<'transfer' | 'leave'>('transfer');
  const [transferReason, setTransferReason] = useState<string>('');
  const [filteredTeams, setFilteredTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentTeam, setCurrentTeam] = useState<any>(null);
  const [currentClub, setCurrentClub] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (selectedClub) {
      const teamsInClub = teams.filter(team => team.club_id === selectedClub);
      setFilteredTeams(teamsInClub);
      setSelectedTeam(null);
    } else {
      setFilteredTeams([]);
      setSelectedTeam(null);
    }
  }, [selectedClub, teams]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch player's current team and club
      if (player) {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select(`
            *,
            team:team_id (
              *,
              club:club_id (*)
            )
          `)
          .eq('id', player.id)
          .single();
          
        if (playerError) {
          throw playerError;
        }
        
        if (playerData?.team) {
          setCurrentTeam(playerData.team);
          if (playerData.team.club) {
            setCurrentClub(playerData.team.club);
          }
        }
      }
      
      // Fetch all clubs
      const { data: clubsData, error: clubsError } = await supabase
        .from('clubs')
        .select('*')
        .order('name');
        
      if (clubsError) throw clubsError;
      setClubs(clubsData || []);
      
      // Fetch all teams with custom names
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('team_name');
        
      if (teamsError) throw teamsError;
      
      // Get team settings for custom names
      const { data: teamSettings, error: settingsError } = await supabase
        .from('team_settings')
        .select('*');
        
      if (settingsError) {
        console.error('Error fetching team settings:', settingsError);
      }
      
      // Get profiles for admin info
      const { data: profiles } = await supabase.from('profiles').select('*');
      
      // Process team names
      const teamsWithCustomNames = teamsData.map(team => {
        const adminProfile = profiles?.find(profile => profile.id === team.admin_id);
        
        // Find custom team name
        const teamSetting = teamSettings?.find(setting => {
          return setting.team_id === team.id || setting.admin_id === team.admin_id;
        });
        
        const displayTeamName = teamSetting?.team_name || team.team_name;
        
        return {
          ...team,
          display_team_name: displayTeamName
        };
      });
      
      setTeams(teamsWithCustomNames || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!player?.id) {
      toast({
        title: "Error",
        description: "No player selected for transfer",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      // Try to check if player_transfers table exists using the execute_sql function
      let tableExists = false;
      
      try {
        const { data, error } = await supabase.rpc('execute_sql', {
          sql_string: `
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'player_transfers'
            ) as table_exists;
          `
        });
        
        if (data && data[0]?.table_exists) {
          tableExists = true;
        }
      } catch (checkError) {
        console.error('Error checking if table exists:', checkError);
        // Fallback: assume table doesn't exist
        tableExists = false;
      }
      
      // If table doesn't exist, try to create it
      if (!tableExists) {
        try {
          // Attempt to create the player_transfers table
          const createTableSQL = `
            CREATE TABLE IF NOT EXISTS public.player_transfers (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              player_id uuid REFERENCES players(id) NOT NULL,
              from_team_id uuid REFERENCES teams(id),
              to_team_id uuid REFERENCES teams(id),
              transfer_date timestamp with time zone DEFAULT now(),
              status text DEFAULT 'pending',
              reason text,
              type text NOT NULL,
              created_at timestamp with time zone DEFAULT now(),
              updated_at timestamp with time zone DEFAULT now()
            );
          `;
          
          // Try to use the execute_sql RPC function if available
          await supabase.rpc('execute_sql', { sql_string: createTableSQL });
          
          console.log('Successfully created player_transfers table');
          tableExists = true;
        } catch (createError) {
          console.error('Failed to create player_transfers table:', createError);
          toast({
            title: "Error",
            description: "Failed to create transfers table. Please contact an administrator.",
            variant: "destructive"
          });
          setSaving(false);
          return;
        }
      }
      
      // Create a transfer record
      const transferData = {
        player_id: player.id,
        from_team_id: currentTeam?.id || null,
        to_team_id: transferType === 'transfer' ? selectedTeam : null,
        reason: transferReason,
        type: transferType,
        status: transferType === 'transfer' ? 'pending' : 'completed',
        updated_at: new Date().toISOString()
      };
      
      const { error: transferError } = await supabase
        .from('player_transfers')
        .insert(transferData);
        
      if (transferError) throw transferError;
      
      // If the player is leaving (not transferring), update their team_id to null immediately
      if (transferType === 'leave') {
        // Update player status to 'inactive'
        const { error: playerUpdateError } = await supabase
          .from('players')
          .update({ 
            team_id: null,
            status: 'inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', player.id);
          
        if (playerUpdateError) throw playerUpdateError;
      }
      
      toast({
        title: "Success",
        description: transferType === 'transfer' 
          ? "Transfer request created and pending approval" 
          : "Player has been moved to Previous Players"
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error processing transfer:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process transfer",
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
          <DialogTitle>Player Transfer</DialogTitle>
          <DialogDescription>
            Transfer {player?.name || 'player'} to another team or mark as left
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Current Status</Label>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium">
                  {currentTeam 
                    ? `Team: ${currentTeam.display_team_name || currentTeam.team_name}` 
                    : 'No Team'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentClub 
                    ? `Club: ${currentClub.name}` 
                    : 'No Club'
                  }
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Transfer Type</Label>
              <RadioGroup 
                value={transferType} 
                onValueChange={(value) => setTransferType(value as 'transfer' | 'leave')}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transfer" id="transfer" />
                  <Label htmlFor="transfer" className="cursor-pointer">Transfer to another team</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="leave" id="leave" />
                  <Label htmlFor="leave" className="cursor-pointer">Player is leaving (move to Previous Players)</Label>
                </div>
              </RadioGroup>
            </div>
            
            {transferType === 'transfer' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="club">Destination Club</Label>
                  <Select
                    value={selectedClub || undefined}
                    onValueChange={(value) => setSelectedClub(value)}
                  >
                    <SelectTrigger id="club" className="w-full">
                      <SelectValue placeholder="Select destination club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedClub && (
                  <div className="space-y-2">
                    <Label htmlFor="team">Destination Team</Label>
                    <Select
                      value={selectedTeam || undefined}
                      onValueChange={(value) => setSelectedTeam(value)}
                      disabled={filteredTeams.length === 0}
                    >
                      <SelectTrigger id="team" className="w-full">
                        <SelectValue placeholder={
                          filteredTeams.length === 0 
                            ? "No teams in this club" 
                            : "Select destination team"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.display_team_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {currentTeam && selectedTeam && (
                  <div className="flex items-center justify-center gap-3 py-2">
                    <span className="text-sm font-medium">{currentTeam.display_team_name || currentTeam.team_name}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {teams.find(t => t.id === selectedTeam)?.display_team_name || "Selected Team"}
                    </span>
                  </div>
                )}
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder={`Reason for ${transferType === 'transfer' ? 'transfer' : 'leaving'}`}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleTransfer} 
            disabled={saving || loading || (transferType === 'transfer' && !selectedTeam)}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {transferType === 'transfer' ? 'Request Transfer' : 'Confirm Player Left'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
