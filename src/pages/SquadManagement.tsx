
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, ArrowUpDown, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Player } from '@/types/player';
import { SortField, SortOrder } from '@/types/squadManagement';

// Import the component that uses this type
import { PlayerCard } from '@/components/squad/PlayerCard';

const SquadManagement = () => {
  const navigate = useNavigate();
  
  // State for sorting and filtering
  const [sortField, setSortField] = useState<SortField>(SortField.SQUAD_NUMBER);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // State for players data
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  
  // Fetch players data
  const { data: players, isLoading, error, refetch } = useQuery({
    queryKey: ['squad-players'],
    queryFn: async () => {
      // Fetch players from the database
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          attributes:player_attributes(*)
        `)
        .order('squad_number', { ascending: true });
      
      if (error) {
        console.error('Error fetching players:', error);
        throw error;
      }
      
      // Process the players data to transform it into the expected format
      const processedPlayers = data.map((player: any) => {
        // Transform player data for each player
        const transformedPlayer: Player = {
          id: player.id,
          name: player.name,
          age: player.age || 0,
          date_of_birth: player.date_of_birth,
          squad_number: player.squad_number || 0,
          player_type: player.player_type || 'OUTFIELD',
          team_id: player.team_id,
          team_category: player.team_category,
          created_at: player.created_at,
          updated_at: player.updated_at,
          self_linked: player.self_linked || false,
          user_id: player.user_id,
          status: player.status || 'active',
          attributes: player.attributes || [],
          // Add any additional properties needed
          objectives: [], // This will be filled later
          squadNumber: player.squad_number || 0,
          dateOfBirth: player.date_of_birth,
          playerType: player.player_type || 'OUTFIELD',
          teamCategory: player.team_category
        };
        
        return transformedPlayer;
      });
      
      return processedPlayers;
    }
  });
  
  // Fetch additional player data like objectives
  const { data: playerObjectives } = useQuery({
    queryKey: ['player-objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_objectives')
        .select('*');
      
      if (error) {
        console.error('Error fetching player objectives:', error);
        return [];
      }
      
      // Group objectives by player_id
      const objectivesByPlayer: Record<string, any[]> = {};
      
      data.forEach((objective: any) => {
        if (!objectivesByPlayer[objective.player_id]) {
          objectivesByPlayer[objective.player_id] = [];
        }
        objectivesByPlayer[objective.player_id].push(objective);
      });
      
      return objectivesByPlayer;
    }
  });
  
  // Fetch position data for players
  const { data: positionData } = useQuery({
    queryKey: ['player-positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('position_suitability')
        .select(`
          player_id,
          suitability_score,
          position_definitions(abbreviation, full_name)
        `)
        .order('suitability_score', { ascending: false });
      
      if (error) {
        console.error('Error fetching positions:', error);
        return {};
      }
      
      // Group positions by player_id
      const positionsByPlayer: Record<string, [string, number][]> = {};
      
      data.forEach((pos: any) => {
        if (!positionsByPlayer[pos.player_id]) {
          positionsByPlayer[pos.player_id] = [];
        }
        
        positionsByPlayer[pos.player_id].push([
          pos.position_definitions.abbreviation,
          pos.suitability_score
        ]);
      });
      
      return positionsByPlayer;
    }
  });
  
  // Apply sorting and filtering when players or sort/filter state changes
  useEffect(() => {
    if (!players) return;
    
    let result = [...players];
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(player => player.team_category === selectedCategory);
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      result = result.filter(player => 
        player.name.toLowerCase().includes(lowercaseTerm) ||
        String(player.squad_number).includes(lowercaseTerm)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valA, valB;
      
      if (sortField === SortField.SQUAD_NUMBER) {
        valA = a.squad_number || 0;
        valB = b.squad_number || 0;
      } 
      else if (sortField === SortField.TECHNICAL) {
        // Calculate average technical rating
        valA = calculateAverageAttribute(a, 'TECHNICAL');
        valB = calculateAverageAttribute(b, 'TECHNICAL');
      }
      else if (sortField === SortField.MENTAL) {
        valA = calculateAverageAttribute(a, 'MENTAL');
        valB = calculateAverageAttribute(b, 'MENTAL');
      }
      else if (sortField === SortField.PHYSICAL) {
        valA = calculateAverageAttribute(a, 'PHYSICAL');
        valB = calculateAverageAttribute(b, 'PHYSICAL');
      }
      else if (sortField === SortField.GOALKEEPING) {
        valA = calculateAverageAttribute(a, 'GOALKEEPER');
        valB = calculateAverageAttribute(b, 'GOALKEEPER');
      }
      else { // Default to name
        valA = a.name;
        valB = b.name;
      }
      
      // Apply sort order
      if (sortOrder === SortOrder.ASC) {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    setFilteredPlayers(result);
  }, [players, sortField, sortOrder, searchTerm, selectedCategory]);
  
  // Helper function to calculate average attribute value
  const calculateAverageAttribute = (player: Player, category: string) => {
    if (!player.attributes || player.attributes.length === 0) return 0;
    
    const categoryAttributes = player.attributes.filter(attr => attr.category === category);
    if (categoryAttributes.length === 0) return 0;
    
    const sum = categoryAttributes.reduce((acc, attr) => acc + attr.value, 0);
    return sum / categoryAttributes.length;
  };
  
  // Function to handle sorting
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      // Set new field and default to ascending order
      setSortField(field);
      setSortOrder(SortOrder.ASC);
    }
  };
  
  // Function to navigate to create player page
  const handleCreatePlayer = () => {
    navigate('/create-player');
  };
  
  // Function to navigate to player details page
  const handleViewPlayer = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };
  
  if (isLoading) {
    return <div>Loading squad data...</div>;
  }
  
  if (error) {
    return <div>Error loading squad: {error.message}</div>;
  }
  
  // Get all unique team categories for filtering
  const categories = players ? Array.from(new Set(players.map(p => p.team_category))) : [];
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Squad Management</h1>
        <Button onClick={handleCreatePlayer} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Player
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search players..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              category && <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SortField.SQUAD_NUMBER}>Squad Number</SelectItem>
            <SelectItem value={SortField.NAME}>Name</SelectItem>
            <SelectItem value={SortField.TECHNICAL}>Technical</SelectItem>
            <SelectItem value={SortField.MENTAL}>Mental</SelectItem>
            <SelectItem value={SortField.PHYSICAL}>Physical</SelectItem>
            <SelectItem value={SortField.GOALKEEPING}>Goalkeeping</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          onClick={() => setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC)}
          className="flex items-center justify-center"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {sortOrder === SortOrder.ASC ? "Ascending" : "Descending"}
        </Button>
      </div>
      
      {/* Player cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => {
            // Enhance player with additional data
            const playerWithDetails = {
              ...player,
              objectives: playerObjectives?.[player.id] || [],
              topPositions: positionData?.[player.id] || []
            };
            
            // Add objectives stats
            const objectives = playerObjectives?.[player.id] || [];
            const completedObjectives = objectives.filter(obj => obj.status === 'COMPLETED').length;
            const improvingObjectives = objectives.filter(obj => obj.status === 'IMPROVING').length;
            const ongoingObjectives = objectives.filter(obj => obj.status === 'ONGOING').length;
                        
            return (
              <Card 
                key={player.id} 
                className="border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewPlayer(player.id)}
              >
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {player.profile_image ? (
                        <img 
                          src={player.profile_image} 
                          alt={player.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold">{player.squad_number}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{player.name}</h3>
                      <div className="text-sm text-muted-foreground">
                        {player.team_category || 'No Category'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Positions */}
                  {playerWithDetails.topPositions && playerWithDetails.topPositions.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Top Positions:</div>
                      <div className="flex gap-1">
                        {playerWithDetails.topPositions.slice(0, 3).map((position, index) => (
                          <div 
                            key={index} 
                            className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                          >
                            {position[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Objectives */}
                  {playerWithDetails.objectives && playerWithDetails.objectives.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Objectives:</div>
                      <div className="grid grid-cols-3 gap-1">
                        <div className="text-xs text-center bg-green-100 text-green-800 rounded py-1">
                          {completedObjectives} Completed
                        </div>
                        <div className="text-xs text-center bg-amber-100 text-amber-800 rounded py-1">
                          {improvingObjectives} Improving
                        </div>
                        <div className="text-xs text-center bg-blue-100 text-blue-800 rounded py-1">
                          {ongoingObjectives} Ongoing
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No players found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadManagement;
