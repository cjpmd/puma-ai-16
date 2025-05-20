import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
import { AddPlayerDialog } from "@/components/AddPlayerDialog";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { calculatePlayerPerformance, getPerformanceColor, getPerformanceText } from "@/utils/playerCalculations";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerTransferManager } from "@/components/squad/PlayerTransferManager";
import { useAuth } from "@/hooks/useAuth";
import { columnExists } from "@/utils/database/columnUtils";

enum SortField {
  NAME = 'name',
  SQUAD_NUMBER = 'squad_number',
  AGE = 'age',
  POSITION = 'position'
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

interface ObjectiveStats {
  completed?: number;
  improving?: number;
  ongoing?: number;
  [key: string]: number | undefined;
}

const SquadManagement = () => {
  const [sortField, setSortField] = useState<SortField>("squadNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [activeTab, setActiveTab] = useState<string>("squad");
  const [hasStatusColumn, setHasStatusColumn] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { profile, hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('globalAdmin');

  // Check if status column exists
  useEffect(() => {
    const checkStatusColumn = async () => {
      try {
        const hasColumn = await columnExists('players', 'status');
        console.log("Status column exists:", hasColumn);
        setHasStatusColumn(hasColumn);
      } catch (err) {
        console.error("Error checking for status column:", err);
        setHasStatusColumn(false);
      }
    };
    
    checkStatusColumn();
  }, []);

  const { data: players, isLoading, error } = useQuery({
    queryKey: ["players", hasStatusColumn],
    queryFn: async () => {
      try {
        console.log("Fetching players data with status column check:", hasStatusColumn);
        
        // Fetch players - adapt query based on status column existence
        let query = supabase
          .from("players")
          .select(`
            *,
            player_attributes (*),
            position_suitability (
              suitability_score,
              position_definitions (
                abbreviation,
                full_name
              )
            )
          `);
          
        // Only filter by status if the column exists
        if (hasStatusColumn) {
          query = query.eq('status', 'active');
        }

        const { data: playersData, error: playersError } = await query;
        
        if (playersError) {
          console.error("Error fetching players:", playersError);
          throw playersError;
        }

        console.log("Players data fetched:", playersData?.length || 0);

        const { data: statsData, error: statsError } = await supabase
          .from("player_stats")
          .select('*');

        if (statsError) {
          console.error("Error fetching player stats:", statsError);
          throw statsError;
        }

        console.log("Player stats data fetched:", statsData?.length || 0);

        return (playersData as any[]).map((player): Player => ({
          id: player.id,
          name: player.name,
          age: player.age,
          date_of_birth: player.date_of_birth,
          squad_number: player.squad_number,
          player_type: player.player_type,
          profile_image: player.profile_image,
          attributes: player.player_attributes?.map((attr: any) => ({
            id: attr.id,
            name: attr.name,
            value: attr.value,
            category: attr.category,
            player_id: attr.player_id,
            created_at: attr.created_at,
          })) || [],
          attributeHistory: {},
          objectives: statsData?.find((stat: any) => stat.player_id === player.id) ? {
            completed: statsData.find((stat: any) => stat.player_id === player.id).completed_objectives,
            improving: statsData.find((stat: any) => stat.player_id === player.id).improving_objectives,
            ongoing: statsData.find((stat: any) => stat.player_id === player.id).ongoing_objectives,
          } : undefined,
          topPositions: player.position_suitability
            ?.sort((a: any, b: any) => b.suitability_score - a.suitability_score)
            .slice(0, 3)
            .map((pos: any) => ({
              position: pos.position_definitions.abbreviation,
              suitability_score: Number(pos.suitability_score)
            })) || [],
          created_at: player.created_at,
          updated_at: player.updated_at,
          // Add status if it exists
          status: player.status,
        }));
      } catch (error) {
        console.error("Error in players query:", error);
        throw error;
      }
    },
    enabled: hasStatusColumn !== null, // Only run once we know if status column exists
  });

  const calculateAttributeAverage = (attributes: Player['attributes'] = [], category: string): number => {
    if (!attributes || attributes.length === 0) return 0;
    const categoryAttributes = attributes.filter(attr => attr.category === category);
    if (categoryAttributes.length === 0) return 0;
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return Number((sum / categoryAttributes.length).toFixed(1));
  };

  const sortPlayers = (playersToSort: Player[] = []) => {
    return [...playersToSort].sort((a, b) => {
      let valueA: number;
      let valueB: number;

      switch (sortField) {
        case "squadNumber":
          valueA = a.squad_number;
          valueB = b.squad_number;
          break;
        case "technical":
          valueA = calculateAttributeAverage(a.attributes, "TECHNICAL");
          valueB = calculateAttributeAverage(b.attributes, "TECHNICAL");
          break;
        case "mental":
          valueA = calculateAttributeAverage(a.attributes, "MENTAL");
          valueB = calculateAttributeAverage(b.attributes, "MENTAL");
          break;
        case "physical":
          valueA = calculateAttributeAverage(a.attributes, "PHYSICAL");
          valueB = calculateAttributeAverage(b.attributes, "PHYSICAL");
          break;
        case "goalkeeping":
          valueA = calculateAttributeAverage(a.attributes, "GOALKEEPING");
          valueB = calculateAttributeAverage(b.attributes, "GOALKEEPING");
          break;
        default:
          return 0;
      }

      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleRowClick = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  const sortedPlayers = players ? sortPlayers(players) : [];

  // Show error state if there's an error
  if (error) {
    console.error("Rendering error state:", error);
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold">Squad Management</h1>
            </div>
          </div>
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error loading players</h2>
            <p className="text-muted-foreground">{String(error)}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state if we're still loading data
  if (isLoading || hasStatusColumn === null) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-4xl font-bold">Squad Management</h1>
            </div>
          </div>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading squad data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Update objectives state to use the proper interface
  const [objectives, setObjectives] = useState<ObjectiveStats>({
    completed: 0,
    improving: 0,
    ongoing: 0
  });

  // Fix the objectives stats fetching code
  const fetchObjectiveStats = async () => {
    try {
      const { data, error } = await supabase.from("player_stats").select("*");
      
      if (error) {
        throw error;
      }
      
      // Initialize stats with proper types
      const stats: ObjectiveStats = {
        completed: 0,
        improving: 0,
        ongoing: 0
      };
      
      // Aggregate stats from player_stats table
      data?.forEach((player: any) => {
        stats.completed = (stats.completed || 0) + (player.completed_objectives || 0);
        stats.improving = (stats.improving || 0) + (player.improving_objectives || 0);
        stats.ongoing = (stats.ongoing || 0) + (player.ongoing_objectives || 0);
      });
      
      setObjectives(stats);
    } catch (error) {
      console.error("Error fetching objective stats:", error);
    }
  };

  fetchObjectiveStats();

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold">Squad Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/top-rated">
              <Button variant="outline">
                Top Rated by Position
              </Button>
            </Link>
            <AddPlayerDialog />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="squad">Current Squad</TabsTrigger>
            <TabsTrigger value="transfers">Player Transfers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="squad">
            {sortedPlayers && sortedPlayers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead onClick={() => handleSort("squadNumber")} className="cursor-pointer">
                      Squad # <ArrowUpDown className="inline h-4 w-4" />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Top Positions</TableHead>
                    <TableHead onClick={() => handleSort("technical")} className="text-center cursor-pointer">
                      Technical <ArrowUpDown className="inline h-4 w-4" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("mental")} className="text-center cursor-pointer">
                      Mental <ArrowUpDown className="inline h-4 w-4" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("physical")} className="text-center cursor-pointer">
                      Physical <ArrowUpDown className="inline h-4 w-4" />
                    </TableHead>
                    <TableHead onClick={() => handleSort("goalkeeping")} className="text-center cursor-pointer">
                      Goalkeeping <ArrowUpDown className="inline h-4 w-4" />
                    </TableHead>
                    <TableHead className="text-right">Objectives Status</TableHead>
                    <TableHead className="text-right">Current Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPlayers.map((player) => {
                    const performanceStatus = calculatePlayerPerformance(player);

                    return (
                      <TableRow
                        key={player.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(player.id)}
                      >
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            {player.profile_image ? (
                              <AvatarImage src={player.profile_image} alt={player.name} />
                            ) : (
                              <AvatarFallback>
                                {player.name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          {player.squad_number}
                        </TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell>{player.age}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {positions.map((pos, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className={`${index === 0 ? 'bg-green-500/10' : index === 1 ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}
                              >
                                {pos.position} ({Number(pos.suitability_score).toFixed(1)}%)
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {calculateAttributeAverage(player.attributes, "TECHNICAL").toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          {calculateAttributeAverage(player.attributes, "MENTAL").toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          {calculateAttributeAverage(player.attributes, "PHYSICAL").toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          {calculateAttributeAverage(player.attributes, "GOALKEEPING").toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Badge variant="outline" className="bg-green-500/10">
                              {player.objectives?.completed || 0}
                            </Badge>
                            <Badge variant="outline" className="bg-amber-500/10">
                              {player.objectives?.improving || 0}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-500/10">
                              {player.objectives?.ongoing || 0}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right ${getPerformanceColor(performanceStatus)}`}>
                          {getPerformanceText(performanceStatus)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No players found. Add players to your squad to get started.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="transfers">
            <PlayerTransferManager isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default SquadManagement;
