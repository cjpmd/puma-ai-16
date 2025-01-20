import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player, Attribute, PlayerCategory, PlayerType } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { calculatePlayerPerformance, getPerformanceColor, getPerformanceText } from "@/utils/playerCalculations";
import { useToast } from "@/hooks/use-toast";

type SortField = "squadNumber" | "technical" | "mental" | "physical" | "goalkeeping";
type SortOrder = "asc" | "desc";

const SquadManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("squadNumber");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: players, isLoading, error } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      try {
        const { data: playersData, error: playersError } = await supabase
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

        if (playersError) {
          console.error("Error fetching players:", playersError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch players data. Please try again.",
          });
          throw playersError;
        }

        const { data: statsData, error: statsError } = await supabase
          .from("player_stats")
          .select('*');

        if (statsError) {
          console.error("Error fetching stats:", statsError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch player statistics. Please try again.",
          });
          throw statsError;
        }

        return (playersData as any[]).map((player): Player => ({
          id: player.id,
          name: player.name,
          age: player.age,
          dateOfBirth: player.date_of_birth,
          squadNumber: player.squad_number,
          playerCategory: player.player_category as PlayerCategory,
          playerType: player.player_type as PlayerType,
          attributes: player.player_attributes.map((attr: any): Attribute => ({
            id: attr.id,
            name: attr.name,
            value: attr.value,
            category: attr.category,
            player_id: attr.player_id,
            created_at: attr.created_at,
          })),
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
        }));
      } catch (error) {
        console.error("Error in players query:", error);
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const calculateAttributeAverage = (attributes: Attribute[], category: string): number => {
    const categoryAttributes = attributes.filter(attr => attr.category === category);
    if (categoryAttributes.length === 0) return 0;
    const sum = categoryAttributes.reduce((acc, curr) => acc + curr.value, 0);
    return Number((sum / categoryAttributes.length).toFixed(1));
  };

  const sortPlayers = (playersToSort: Player[]) => {
    return [...playersToSort].sort((a, b) => {
      let valueA: number;
      let valueB: number;

      switch (sortField) {
        case "squadNumber":
          valueA = a.squadNumber;
          valueB = b.squadNumber;
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

  const filteredPlayers = selectedCategory
    ? players?.filter((player) => player.playerCategory === selectedCategory)
    : players;

  const sortedPlayers = filteredPlayers ? sortPlayers(filteredPlayers) : [];

  const handleRowClick = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

  // Calculate category counts
  const getCategoryCounts = () => {
    if (!players) return { RONALDO: 0, MESSI: 0, JAGS: 0, total: 0 };
    
    return players.reduce((acc, player) => {
      acc[player.playerCategory as keyof typeof acc]++;
      acc.total++;
      return acc;
    }, { RONALDO: 0, MESSI: 0, JAGS: 0, total: 0 });
  };

  const categoryCounts = getCategoryCounts();

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Squad Data</h2>
          <p className="text-gray-600 mb-4">There was a problem loading the squad information.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mx-auto"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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

        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All Players ({categoryCounts.total})
          </Button>
          <Button
            variant={selectedCategory === "RONALDO" ? "default" : "outline"}
            onClick={() => setSelectedCategory("RONALDO")}
          >
            Ronaldo Category ({categoryCounts.RONALDO})
          </Button>
          <Button
            variant={selectedCategory === "MESSI" ? "default" : "outline"}
            onClick={() => setSelectedCategory("MESSI")}
          >
            Messi Category ({categoryCounts.MESSI})
          </Button>
          <Button
            variant={selectedCategory === "JAGS" ? "default" : "outline"}
            onClick={() => setSelectedCategory("JAGS")}
          >
            Jags Category ({categoryCounts.JAGS})
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading squad data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("squadNumber")} className="cursor-pointer">
                  Squad # <ArrowUpDown className="inline h-4 w-4" />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Category</TableHead>
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
              {sortedPlayers?.map((player) => {
                const performanceStatus = calculatePlayerPerformance(player);

                return (
                  <TableRow
                    key={player.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(player.id)}
                  >
                    <TableCell className="font-medium">
                      {player.squadNumber}
                    </TableCell>
                    <TableCell>{player.name}</TableCell>
                    <TableCell>{player.age}</TableCell>
                    <TableCell>{player.playerCategory}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {player.topPositions?.map((pos, index) => (
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
        )}
      </motion.div>
    </div>
  );
};

export default SquadManagement;
