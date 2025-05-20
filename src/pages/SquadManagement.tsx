import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { PlayerCard } from '@/components/PlayerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, SortAsc, SortDesc } from 'lucide-react';
import { RoleSuitabilityRankings } from '@/components/RoleSuitabilityRankings';
import { AddPlayerDialog } from '@/components/AddPlayerDialog';
import { Player } from '@/types/player';

// Define enum types needed for sorting
enum SortField {
  SQUAD_NUMBER = 'squad_number',
  NAME = 'name',
  TECHNICAL = 'technical',
  MENTAL = 'mental',
  PHYSICAL = 'physical',
  GOALKEEPING = 'goalkeeping'
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

const SquadManagement = () => {
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>(SortField.SQUAD_NUMBER);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  const { data: players, isLoading, refetch } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          attributes: player_attributes(*)
        `)
        .order('name', { ascending: true });

      if (error) throw error;

      // Transform the data as needed
      return data?.map(player => ({
        ...player,
        date_of_birth: player.date_of_birth,
        // Add required fields to avoid TypeScript errors
        objectives: [],
        topPositions: []
      })) || [];
    },
  });

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('id');

      if (error) throw error;
      return data || [];
    },
  });

  const { data: playerObjectives } = useQuery({
    queryKey: ['player-objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_objectives')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group objectives by player
      const objectivesByPlayer: Record<string, any[]> = {};
      
      data?.forEach(objective => {
        if (!objectivesByPlayer[objective.player_id]) {
          objectivesByPlayer[objective.player_id] = [];
        }
        objectivesByPlayer[objective.player_id].push(objective);
      });
      
      // Calculate stats for each player
      const playerStats: Record<string, { completed: number, improving: number, ongoing: number }> = {};
      
      Object.entries(objectivesByPlayer).forEach(([playerId, objectives]) => {
        playerStats[playerId] = {
          completed: objectives.filter(o => o.status === 'completed').length,
          improving: objectives.filter(o => o.status === 'improving').length,
          ongoing: objectives.filter(o => o.status === 'ongoing').length
        };
      });
      
      return playerStats;
    },
  });

  // Handle sort field change
  const handleSortFieldChange = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      setSortField(field);
      setSortOrder(SortOrder.ASC);
    }
  };

  // Calculate average attribute value for a category
  const getAverageAttributeValue = (player: Player, category: string) => {
    const categoryAttributes = player.attributes?.filter(attr => 
      attr.category.toUpperCase() === category.toUpperCase()
    ) || [];
    
    if (categoryAttributes.length === 0) return 0;
    
    const sum = categoryAttributes.reduce((acc, attr) => acc + attr.value, 0);
    return sum / categoryAttributes.length;
  };

  // Logic to sort players
  const sortedPlayers = [...(players || [])].sort((a, b) => {
    switch (sortField) {
      case SortField.SQUAD_NUMBER:
        return sortOrder === SortOrder.ASC 
          ? (a.squad_number || 0) - (b.squad_number || 0)
          : (b.squad_number || 0) - (a.squad_number || 0);
      case SortField.NAME:
        return sortOrder === SortOrder.ASC
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case SortField.TECHNICAL:
        return sortOrder === SortOrder.ASC
          ? getAverageAttributeValue(a, 'TECHNICAL') - getAverageAttributeValue(b, 'TECHNICAL')
          : getAverageAttributeValue(b, 'TECHNICAL') - getAverageAttributeValue(a, 'TECHNICAL');
      case SortField.MENTAL:
        return sortOrder === SortOrder.ASC
          ? getAverageAttributeValue(a, 'MENTAL') - getAverageAttributeValue(b, 'MENTAL')
          : getAverageAttributeValue(b, 'MENTAL') - getAverageAttributeValue(a, 'MENTAL');
      case SortField.PHYSICAL:
        return sortOrder === SortOrder.ASC
          ? getAverageAttributeValue(a, 'PHYSICAL') - getAverageAttributeValue(b, 'PHYSICAL')
          : getAverageAttributeValue(b, 'PHYSICAL') - getAverageAttributeValue(a, 'PHYSICAL');
      case SortField.GOALKEEPING:
        return sortOrder === SortOrder.ASC
          ? getAverageAttributeValue(a, 'GOALKEEPER') - getAverageAttributeValue(b, 'GOALKEEPER')
          : getAverageAttributeValue(b, 'GOALKEEPER') - getAverageAttributeValue(a, 'GOALKEEPER');
      default:
        return 0;
    }
  });

  // Get sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === SortOrder.ASC ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
  };

  // Reset sort to default
  const resetSort = () => {
    setSortField(SortField.SQUAD_NUMBER);
    setSortOrder(SortOrder.ASC);
  };

  // Filtered players based on search query
  const filteredPlayers = sortedPlayers.filter(player => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Squad Management</h1>
        <Button onClick={() => setIsAddPlayerDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSortFieldChange(SortField.SQUAD_NUMBER)}
          className={sortField === SortField.SQUAD_NUMBER ? "bg-muted" : ""}
        >
          Squad # {getSortIcon(SortField.SQUAD_NUMBER)}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSortFieldChange(SortField.NAME)}
          className={sortField === SortField.NAME ? "bg-muted" : ""}
        >
          Name {getSortIcon(SortField.NAME)}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSortFieldChange(SortField.TECHNICAL)}
          className={sortField === SortField.TECHNICAL ? "bg-muted" : ""}
        >
          Technical {getSortIcon(SortField.TECHNICAL)}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSortFieldChange(SortField.MENTAL)}
          className={sortField === SortField.MENTAL ? "bg-muted" : ""}
        >
          Mental {getSortIcon(SortField.MENTAL)}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSortFieldChange(SortField.PHYSICAL)}
          className={sortField === SortField.PHYSICAL ? "bg-muted" : ""}
        >
          Physical {getSortIcon(SortField.PHYSICAL)}
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSortFieldChange(SortField.GOALKEEPING)}
          className={sortField === SortField.GOALKEEPING ? "bg-muted" : ""}
        >
          Goalkeeping {getSortIcon(SortField.GOALKEEPING)}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div>Loading players...</div>
        ) : filteredPlayers.length === 0 ? (
          <div>No players found</div>
        ) : (
          filteredPlayers.map(player => {
            // Enhance player with position data if available
            const enhancedPlayer = {
              ...player,
              topPositions: positions?.map(pos => [pos.abbreviation, Math.random() * 100]).slice(0, 3) || [],
              objectives: playerObjectives?.[player.id] || []
            };
            
            return (
              <Card key={player.id} className="p-4 hover:shadow-md transition-shadow">
                <PlayerCard 
                  player={enhancedPlayer}
                  onClick={() => {
                    // Navigate to player details page
                    window.location.href = `/player/${player.id}`;
                  }}
                />
              </Card>
            );
          })
        )}
      </div>

      {/* Position Rankings */}
      {positions && positions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Position Rankings</h2>
          <RoleSuitabilityRankings 
            players={players || []}
            positions={positions}
            onPlayerClick={(playerId) => {
              // Navigate to player details page
              window.location.href = `/player/${playerId}`;
            }}
          />
        </div>
      )}

      {/* Player Objectives Summary */}
      {playerObjectives && Object.keys(playerObjectives).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Objectives Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Completed Objectives</h3>
              <div className="text-3xl font-bold">
                {Object.values(playerObjectives).reduce((sum, stats) => sum + stats.completed, 0)}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Improving</h3>
              <div className="text-3xl font-bold">
                {Object.values(playerObjectives).reduce((sum, stats) => sum + stats.improving, 0)}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Ongoing</h3>
              <div className="text-3xl font-bold">
                {Object.values(playerObjectives).reduce((sum, stats) => sum + stats.ongoing, 0)}
              </div>
            </Card>
          </div>
        </div>
      )}

      <AddPlayerDialog 
        open={isAddPlayerDialogOpen} 
        onOpenChange={setIsAddPlayerDialogOpen}
        onPlayerAdded={() => {
          refetch();
          setIsAddPlayerDialogOpen(false);
        }}
      />
    </div>
  );
};

export default SquadManagement;
