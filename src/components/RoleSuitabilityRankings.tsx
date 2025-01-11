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

interface RoleSuitabilityProps {
  roleId: string;
  limit?: number;
}

export const RoleSuitabilityRankings = ({ roleId, limit = 5 }: RoleSuitabilityProps) => {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ["role-suitability", roleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_suitability")
        .select(`
          suitability_score,
          players (
            name,
            age,
            squad_number
          ),
          role_definitions (
            abbreviation,
            full_name
          )
        `)
        .eq("role_id", roleId)
        .order("suitability_score", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading rankings...</div>;
  }

  if (!rankings || rankings.length === 0) {
    return <div>No rankings available</div>;
  }

  const roleName = rankings[0].role_definitions?.full_name || "Unknown Role";
  const roleAbbr = rankings[0].role_definitions?.abbreviation || "??";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {roleName} ({roleAbbr})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Suitability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((ranking, index) => (
                <TableRow key={`${ranking.players?.name}-${index}`}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{ranking.players?.name}</TableCell>
                  <TableCell className="text-right">
                    {`${Number(ranking.suitability_score).toFixed(1)}%`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};