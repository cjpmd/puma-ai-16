import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Player, Attribute, PlayerCategory, AttributeCategory } from "@/types/player";
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
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { AddPlayerDialog } from "@/components/AddPlayerDialog";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface SupabasePlayer {
  id: string;
  name: string;
  age: number;
  squad_number: number;
  player_category: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
  player_attributes: {
    id: string;
    name: string;
    value: number;
    category: string;
    player_id: string;
    created_at: string;
  }[];
}

const SquadManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: players, isLoading } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          player_attributes (*)
        `);

      if (error) throw error;

      return (data as SupabasePlayer[]).map((player): Player => ({
        id: player.id,
        name: player.name,
        age: player.age,
        dateOfBirth: player.date_of_birth,
        squadNumber: player.squad_number,
        playerCategory: player.player_category as PlayerCategory,
        attributes: player.player_attributes.map((attr): Attribute => ({
          id: attr.id,
          name: attr.name,
          value: attr.value,
          category: attr.category as AttributeCategory,
          player_id: attr.player_id,
          created_at: attr.created_at,
        })),
        attributeHistory: {},
        created_at: player.created_at,
        updated_at: player.updated_at,
      }));
    },
  });

  const filteredPlayers = selectedCategory
    ? players?.filter((player) => player.playerCategory === selectedCategory)
    : players;

  const calculateAttributeChange = (player: Player, category: string) => {
    const categoryAttributes = player.attributes.filter(
      (attr) => attr.category === category
    );
    if (categoryAttributes.length === 0) return { value: "N/A", trend: "neutral" };

    const sortedByDate = [...categoryAttributes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const recentValues = sortedByDate.slice(0, Math.ceil(sortedByDate.length / 2));
    const olderValues = sortedByDate.slice(Math.ceil(sortedByDate.length / 2));

    const recentAvg = recentValues.reduce((sum, attr) => sum + attr.value, 0) / recentValues.length;
    const olderAvg = olderValues.length > 0 
      ? olderValues.reduce((sum, attr) => sum + attr.value, 0) / olderValues.length
      : recentAvg;

    const value = recentAvg.toFixed(1);
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return { value, trend: "improving" };
    if (difference < -0.5) return { value, trend: "needs-improvement" };
    return { value, trend: "maintaining" };
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case "improving":
        return "text-green-500";
      case "needs-improvement":
        return "text-amber-500";
      default:
        return "text-blue-500";
    }
  };

  const getPerformanceText = (status: string) => {
    switch (status) {
      case "improving":
        return "Improving";
      case "needs-improvement":
        return "Needs Improvement";
      default:
        return "Maintaining";
    }
  };

  const getImprovementTrend = (player: Player) => {
    const allAttributes = player.attributes;
    if (allAttributes.length === 0) return "neutral";

    const sortedByDate = [...allAttributes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const recentValues = sortedByDate.slice(0, sortedByDate.length / 2);
    const olderValues = sortedByDate.slice(sortedByDate.length / 2);

    const recentAvg = recentValues.reduce((sum, attr) => sum + attr.value, 0) / recentValues.length;
    const olderAvg = olderValues.reduce((sum, attr) => sum + attr.value, 0) / olderValues.length;

    const difference = recentAvg - olderAvg;
    if (difference > 0.5) return "improving";
    if (difference < -0.5) return "needs-improvement";
    return "maintaining";
  };

  const handleRowClick = (playerId: string) => {
    navigate(`/player/${playerId}`);
  };

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
          <AddPlayerDialog />
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            All Players
          </Button>
          <Button
            variant={selectedCategory === "RONALDO" ? "default" : "outline"}
            onClick={() => setSelectedCategory("RONALDO")}
          >
            Ronaldo Category
          </Button>
          <Button
            variant={selectedCategory === "MESSI" ? "default" : "outline"}
            onClick={() => setSelectedCategory("MESSI")}
          >
            Messi Category
          </Button>
          <Button
            variant={selectedCategory === "JAGS" ? "default" : "outline"}
            onClick={() => setSelectedCategory("JAGS")}
          >
            Jags Category
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading squad data...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Squad #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Technical</TableHead>
                <TableHead className="text-center">Mental</TableHead>
                <TableHead className="text-center">Physical</TableHead>
                <TableHead className="text-center">Goalkeeping</TableHead>
                <TableHead className="text-right">Objectives Status</TableHead>
                <TableHead className="text-right">Current Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers?.map((player) => {
                const performanceStatus = getImprovementTrend(player);
                const technicalStats = calculateAttributeChange(player, "TECHNICAL");
                const mentalStats = calculateAttributeChange(player, "MENTAL");
                const physicalStats = calculateAttributeChange(player, "PHYSICAL");
                const goalkeepingStats = calculateAttributeChange(player, "GOALKEEPING");

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
                    <TableCell>{format(new Date(player.dateOfBirth), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{player.playerCategory}</TableCell>
                    <TableCell className={`text-center ${getPerformanceColor(technicalStats.trend)}`}>
                      {technicalStats.value}
                    </TableCell>
                    <TableCell className={`text-center ${getPerformanceColor(mentalStats.trend)}`}>
                      {mentalStats.value}
                    </TableCell>
                    <TableCell className={`text-center ${getPerformanceColor(physicalStats.trend)}`}>
                      {physicalStats.value}
                    </TableCell>
                    <TableCell className={`text-center ${getPerformanceColor(goalkeepingStats.trend)}`}>
                      {goalkeepingStats.value}
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
