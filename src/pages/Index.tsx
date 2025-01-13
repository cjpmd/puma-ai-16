import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Index() {
  const { data: recentFixtures } = useQuery({
    queryKey: ["recent-fixtures"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .order("date", { ascending: true })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: squadStats } = useQuery({
    queryKey: ["squad-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select(`
          *,
          player_attributes (*)
        `);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Squad</CardTitle>
              <Link to="/squad">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {squadStats?.map((player) => (
                <div key={player.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Squad Number: {player.squad_number}
                    </div>
                  </div>
                  <Badge variant="outline">{player.player_category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upcoming Fixtures</CardTitle>
              <Link to="/fixtures">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentFixtures?.map((fixture) => (
                <div
                  key={fixture.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <div className="font-medium">{fixture.opponent}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(fixture.date), "PPP")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {fixture.location || "TBD"}
                    </div>
                  </div>
                  <Badge variant="outline">{fixture.category}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
