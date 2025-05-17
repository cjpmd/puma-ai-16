
import { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, ArrowRight, UserPlus, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerTransferDialog } from '@/components/admin/PlayerTransferDialog';
import { TransferApprovalDialog } from '@/components/admin/TransferApprovalDialog';

interface PlayerTransferManagerProps {
  teamId?: string;
  isAdmin?: boolean;
}

export const PlayerTransferManager = ({ teamId, isAdmin = false }: PlayerTransferManagerProps) => {
  const [activeTab, setActiveTab] = useState<'current' | 'previous' | 'pending'>('current');
  const [currentPlayers, setCurrentPlayers] = useState<any[]>([]);
  const [previousPlayers, setPreviousPlayers] = useState<any[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayersData();
  }, [teamId]);

  const fetchPlayersData = async () => {
    setLoading(true);
    try {
      // First, ensure we have the player_transfers table for tracking transfers
      await supabase.rpc('create_table_if_not_exists', { 
        p_table_name: 'player_transfers',
        p_table_definition: `
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          player_id uuid REFERENCES players(id) NOT NULL,
          from_team_id uuid REFERENCES teams(id),
          to_team_id uuid REFERENCES teams(id),
          transfer_date timestamp with time zone DEFAULT now(),
          status text DEFAULT 'pending',
          reason text,
          type text NOT NULL,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone
        `
      });
      
      // Add status column to players table if it doesn't exist
      await supabase.rpc('add_column_if_not_exists', {
        p_table_name: 'players',
        p_column_name: 'status',
        p_column_def: 'text DEFAULT \'active\''
      });
      
      // Fetch current active players
      let query = supabase
        .from('players')
        .select(`
          *,
          player_attributes (*),
          position_suitability (
            suitability_score,
            position_definitions (abbreviation, full_name)
          )
        `)
        .eq('status', 'active');
        
      if (teamId) {
        query = query.eq('team_id', teamId);
      }
      
      const { data: currentPlayersData, error: currentError } = await query;
      
      if (currentError) throw currentError;
      setCurrentPlayers(currentPlayersData || []);
      
      // Fetch previous players (inactive status or with transfer history from this team)
      let previousQuery = supabase
        .from('players')
        .select(`
          *,
          player_attributes (*),
          position_suitability (
            suitability_score,
            position_definitions (abbreviation, full_name)
          )
        `)
        .eq('status', 'inactive');
        
      if (teamId) {
        // Also include players that were transferred from this team
        const { data: transfers } = await supabase
          .from('player_transfers')
          .select('player_id')
          .eq('from_team_id', teamId)
          .eq('status', 'completed');
          
        if (transfers && transfers.length > 0) {
          const playerIds = transfers.map(t => t.player_id);
          previousQuery = previousQuery.or(`id.in.(${playerIds.join(',')}),team_id.is.null`);
        }
      }
      
      const { data: previousPlayersData, error: previousError } = await previousQuery;
      
      if (previousError) throw previousError;
      setPreviousPlayers(previousPlayersData || []);
      
      // Fetch pending transfers
      let transfersQuery = supabase
        .from('player_transfers')
        .select(`
          *,
          player:player_id (*),
          from_team:from_team_id (*),
          to_team:to_team_id (*)
        `)
        .eq('status', 'pending');
      
      if (teamId) {
        // If we're in a specific team view, only show transfers to/from this team
        transfersQuery = transfersQuery.or(`from_team_id.eq.${teamId},to_team_id.eq.${teamId}`);
      }
      
      const { data: transfersData, error: transfersError } = await transfersQuery;
      
      if (transfersError) throw transfersError;
      setPendingTransfers(transfersData || []);
      
    } catch (error) {
      console.error('Error fetching players data:', error);
      toast({
        title: "Error",
        description: "Failed to load players data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferClick = (player: any) => {
    setSelectedPlayer(player);
    setTransferDialogOpen(true);
  };

  const handleApprovalClick = (transfer: any) => {
    setSelectedTransfer(transfer);
    setApprovalDialogOpen(true);
  };

  const getFilteredPlayers = (players: any[]) => {
    if (!searchQuery) return players;
    
    return players.filter(player => 
      player.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.age?.toString().includes(searchQuery)
    );
  };

  const getFilteredTransfers = (transfers: any[]) => {
    if (!searchQuery) return transfers;
    
    return transfers.filter(transfer => 
      transfer.player?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.from_team?.team_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.to_team?.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const calculateAttributeAverage = (attributes = [], category: string) => {
    if (!attributes || attributes.length === 0) return 0;
    const categoryAttributes = attributes.filter(attr => attr.category === category);
    if (categoryAttributes.length === 0) return 0;
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return Number((sum / categoryAttributes.length).toFixed(1));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PP');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'current' | 'previous' | 'pending')}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="current">
              Current Squad
              {currentPlayers.length > 0 && <Badge variant="outline" className="ml-2">{currentPlayers.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="previous">
              Previous Players
              {previousPlayers.length > 0 && <Badge variant="outline" className="ml-2">{previousPlayers.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Transfers
              {pendingTransfers.length > 0 && <Badge variant="outline" className="ml-2">{pendingTransfers.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search players..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <TabsContent value="current" className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="text-center">Technical</TableHead>
                    <TableHead className="text-center">Mental</TableHead>
                    <TableHead className="text-center">Physical</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredPlayers(currentPlayers).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                        No players found
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredPlayers(currentPlayers).map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            {player.profileImage ? (
                              <AvatarImage src={player.profileImage} alt={player.name} />
                            ) : (
                              <AvatarFallback>
                                {player.name?.charAt(0) || "P"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.age}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {(player.position_suitability || [])
                              .sort((a, b) => b.suitability_score - a.suitability_score)
                              .slice(0, 2)
                              .map((pos, idx) => (
                                <Badge key={idx} variant="outline">
                                  {pos.position_definitions.abbreviation}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {calculateAttributeAverage(player.player_attributes, "TECHNICAL").toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          {calculateAttributeAverage(player.player_attributes, "MENTAL").toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          {calculateAttributeAverage(player.player_attributes, "PHYSICAL").toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleTransferClick(player)}
                            >
                              Transfer
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="previous" className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredPlayers(previousPlayers).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No previous players found
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredPlayers(previousPlayers).map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            {player.profileImage ? (
                              <AvatarImage src={player.profileImage} alt={player.name} />
                            ) : (
                              <AvatarFallback>
                                {player.name?.charAt(0) || "P"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.age}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {(player.position_suitability || [])
                              .sort((a, b) => b.suitability_score - a.suitability_score)
                              .slice(0, 2)
                              .map((pos, idx) => (
                                <Badge key={idx} variant="outline">
                                  {pos.position_definitions.abbreviation}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Inactive</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleTransferClick(player)}
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Reactivate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTransfers(pendingTransfers).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No pending transfers
                      </TableCell>
                    </TableRow>
                  ) : (
                    getFilteredTransfers(pendingTransfers).map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {transfer.player?.profileImage ? (
                                <AvatarImage src={transfer.player.profileImage} alt={transfer.player.name} />
                              ) : (
                                <AvatarFallback>
                                  {transfer.player?.name?.charAt(0) || "P"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <span>{transfer.player?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transfer.from_team?.team_name || 'No Team'}</TableCell>
                        <TableCell>{transfer.to_team?.team_name || 'No Team'}</TableCell>
                        <TableCell>{formatDate(transfer.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant={transfer.type === 'transfer' ? 'default' : 'secondary'}>
                            {transfer.type === 'transfer' ? 'Transfer' : 'Left Club'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isAdmin && transfer.to_team_id === teamId && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApprovalClick(transfer)}
                            >
                              Review
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </>
      )}
      
      {/* Transfer Dialog */}
      {selectedPlayer && (
        <PlayerTransferDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          player={selectedPlayer}
          onSuccess={fetchPlayersData}
        />
      )}
      
      {/* Approval Dialog */}
      {selectedTransfer && (
        <TransferApprovalDialog
          open={approvalDialogOpen}
          onOpenChange={setApprovalDialogOpen}
          transfer={selectedTransfer}
          onSuccess={fetchPlayersData}
        />
      )}
    </div>
  );
};
