import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const TopRatedByPosition = () => {
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ["position-definitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_definitions")
        .select("*")
        .order("abbreviation");

      if (error) throw error;
      return data;
    },
  });

  const { data: rankings, isLoading: rankingsLoading } = useQuery({
    queryKey: ["position-rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("position_rankings")
        .select("*")
        .order("position")
        .order("suitability_score", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (positionsLoading || rankingsLoading) {
    return <div className="container mx-auto p-6">Loading rankings...</div>;
  }

  const groupedRankings = rankings?.reduce((acc: any, curr) => {
    if (!acc[curr.position]) {
      acc[curr.position] = [];
    }
    acc[curr.position].push(curr);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center gap-4">
          <Link to="/squad">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">Top Rated by Position</h1>
        </div>

        <Tabs defaultValue={positions?.[0]?.abbreviation} className="space-y-4">
          <TabsList className="flex flex-wrap gap-2">
            {positions?.map((position) => (
              <TabsTrigger
                key={position.abbreviation}
                value={position.abbreviation}
                className="px-4 py-2"
              >
                {position.abbreviation}
              </TabsTrigger>
            ))}
          </TabsList>

          {positions?.map((position) => (
            <TabsContent
              key={position.abbreviation}
              value={position.abbreviation}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle>
                    {position.full_name} ({position.abbreviation})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedRankings?.[position.abbreviation]?.map(
                          (ranking: any, index: number) => (
                            <TableRow key={`${ranking.player_id}-${index}`}>
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>
                              <TableCell>{ranking.player_name}</TableCell>
                              <TableCell className="text-right">
                                {ranking.suitability_score.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </div>
  );
};

export default TopRatedByPosition;