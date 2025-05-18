
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
import { toast } from 'sonner';
import { Search, Loader2, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayerTransferDialog } from '@/components/admin/PlayerTransferDialog';
import { TransferApprovalDialog } from '@/components/admin/TransferApprovalDialog';
import { columnExists, tableExists } from '@/utils/database/columnUtils';
import { verifyTransferSystem, setupTransferSystem } from '@/utils/database/transferSystem';

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
  const [settingUp, setSettingUp] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [statusColumnExists, setStatusColumnExists] = useState(false);
  const [transfersTableExists, setTransfersTableExists] = useState(false);
  const [databaseSetupChecked, setDatabaseSetupChecked] = useState(false);

  useEffect(() => {
    checkTablesWithTimeout();
    fetchPlayersData();
  }, [teamId]);

  // Check required database structure with a timeout
  const checkTablesWithTimeout = async () => {
    try {
      // Set a timeout to prevent hanging if the checks fail
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.log("Database setup check timed out");
          resolve(false);
        }, 2000);
      });
      
      // Run the actual checks
      const checkPromise = checkTables();
      
      // Race between timeout and check
      await Promise.race([timeoutPromise, checkPromise]);
      
      // Mark check as completed regardless of result
      setDatabaseSetupChecked(true);
    } catch (error) {
      console.error("Error during database setup check:", error);
      setDatabaseSetupChecked(true);
    }
  };

  // Check required database structure
  const checkTables = async () => {
    try {
      // Try-catch for each individual check to prevent complete failure
      let hasStatusColumn = false;
      try {
        // Check if status column exists
        hasStatusColumn = await columnExists('players', 'status');
        console.log("Status column exists:", hasStatusColumn);
      } catch (error) {
        console.error("Error checking if column status exists in table players:", error);
      }
      setStatusColumnExists(hasStatusColumn);
      
      let hasTransfersTable = false;
      try {
        // Check if transfers table exists
        hasTransfersTable = await tableExists('player_transfers');
        console.log("Player transfers table exists:", hasTransfersTable);
      } catch (error) {
        console.error("Error checking if table player_transfers exists:", error);
      }
      setTransfersTableExists(hasTransfersTable);
      
      return true;
    } catch (error) {
      console.error("Error checking database structure:", error);
      return false;
    }
  };

  const setupDatabase = async () => {
    setSettingUp(true);
    try {
      // First check if the setup function exists
      const result = await setupTransferSystem();
      
      if (result) {
        toast.success("Transfer system tables have been set up successfully.");
        // Re-check table structure after setup
        await checkTables();
        await fetchPlayersData();
      } else {
        toast.error("Could not set up transfer system tables. Please contact an administrator.");
      }
    } catch (error) {
      console.error("Error setting up database:", error);
      toast.error("An error occurred while setting up transfer system tables.");
    } finally {
      setSettingUp(false);
    }
  };

  const fetchPlayersData = async () => {
    setLoading(true);
    try {
      console.log("Fetching players data with status column check:", statusColumnExists);
      
      // Fetch current active players - adapt query based on status column existence
      let query = supabase
        .from('players')
        .select(`
          *,
          player_attributes (*),
          position_suitability (
            suitability_score,
            position_definitions (abbreviation, full_name)
          )
        `);
        
      // Only filter by status if the column exists
      if (statusColumnExists) {
        query = query.eq('status', 'active');
      }
      
      if (teamId) {
        query = query.eq('team_id', teamId);
      }
      
      const { data: currentPlayersData, error: currentError } = await query;
      
      if (currentError) throw currentError;
      console.log("Players data fetched:", currentPlayersData?.length || 0);
      setCurrentPlayers(currentPlayersData || []);
      
      // Fetch previous players - adapt query based on status column existence
      let previousQuery = supabase
        .from('players')
        .select(`
          *,
          player_attributes (*),
          position_suitability (
            suitability_score,
            position_definitions (abbreviation, full_name)
          )
        `);
      
      if (statusColumnExists) {
        previousQuery = previousQuery.eq('status', 'inactive');
      } else {
        // If status doesn't exist yet, just fetch players without a team as "previous"
        previousQuery = previousQuery.is('team_id', null);
      }
        
      if (teamId) {
        previousQuery = previousQuery.eq('team_id', teamId);
      }
      
      const { data: previousPlayersData, error: previousError } = await previousQuery;
      
      if (previousError) throw previousError;
      console.log("Player stats data fetched:", previousPlayersData?.length || 0);
      setPreviousPlayers(previousPlayersData || []);
      
      // Only fetch transfers if the table exists
      if (transfersTableExists) {
        fetchPendingTransfers();
      } else {
        console.log("Transfers table doesn't exist, skipping transfer data fetch");
        setPendingTransfers([]);
      }
      
    } catch (error) {
      console.error('Error fetching players data:', error);
      toast.error("Failed to load players data");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPendingTransfers = async () => {
    try {
      // Try fetching pending transfers with simpler query (no joins)
      const { data: transfersData, error: transfersError } = await supabase
        .from('player_transfers')
        .select('*')
        .eq('status', 'pending');
        
      if (transfersError) throw transfersError;
      
      // Then fetch related data separately for each transfer
      const enhancedTransfers = await Promise.all((transfersData || []).map(async (transfer) => {
        // Get player details
        const { data: player } = await supabase
          .from('players')
          .select('*')
          .eq('id', transfer.player_id)
          .single();
          
        // Get from team
        const { data: fromTeam } = transfer.from_team_id ? await supabase
          .from('teams')
          .select('*')
          .eq('id', transfer.from_team_id)
          .single() : { data: null };
          
        // Get to team
        const { data: toTeam } = transfer.to_team_id ? await supabase
          .from('teams')
          .select('*')
          .eq('id', transfer.to_team_id)
          .single() : { data: null };
          
        return {
          ...transfer,
          player,
          from_team: fromTeam,
          to_team: toTeam
        };
      }));
      
      setPendingTransfers(enhancedTransfers);
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      setPendingTransfers([]);
    }
  };

  const handleTransferClick = (player: any) => {
    if (!transfersTableExists) {
      toast.error("The transfer system is not set up yet. Please contact an administrator.", {
        description: "Transfer System Unavailable"
      });
      return;
    }
    
    setSelectedPlayer(player);
    setTransferDialogOpen(true);
  };

  const handleApprovalClick = (transfer: any) => {
    if (!transfersTableExists) {
      toast.error("The transfer system is not set up yet. Please contact an administrator.", {
        description: "Transfer System Unavailable"
      });
      return;
    }
    
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

  const renderTransferSystemMessage = () => {
    if (!databaseSetupChecked) {
      return (
        <div className="bg-muted border rounded-md p-4 mb-4">
          <h3 className="text-muted-foreground font-medium">Checking database configuration...</h3>
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Verifying transfer system setup</p>
          </div>
        </div>
      );
    }
    
    if (!transfersTableExists) {
      return (
        <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-4">
          <h3 className="text-amber-800 font-medium">Transfer System Not Available</h3>
          <p className="text-amber-700 text-sm mt-1">
            The player transfer system tables have not been set up in the database yet.
          </p>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={setupDatabase} 
              disabled={settingUp}
              className="mt-3 bg-white"
            >
              {settingUp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Set Up Transfer System
                </>
              )}
            </Button>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {renderTransferSystemMessage()}
      
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
                              disabled={!transfersTableExists}
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
                  {!transfersTableExists ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        Transfer system is not enabled
                      </TableCell>
                    </TableRow>
                  ) : getFilteredTransfers(pendingTransfers).length === 0 ? (
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
                          {isAdmin && teamId && transfer.to_team_id === teamId && (
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
      {selectedPlayer && transfersTableExists && (
        <PlayerTransferDialog
          open={transferDialogOpen}
          onOpenChange={setTransferDialogOpen}
          player={selectedPlayer}
          onSuccess={fetchPlayersData}
        />
      )}
      
      {/* Approval Dialog */}
      {selectedTransfer && transfersTableExists && (
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
