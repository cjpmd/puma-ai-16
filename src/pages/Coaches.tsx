import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddEditCoachDialog } from "@/components/coaches/AddEditCoachDialog";

export const Coaches = () => {
  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data: coachesData, error: coachesError } = await supabase
        .from("coaches")
        .select("*, coach_badges(coaching_badges(*))");

      if (coachesError) {
        throw coachesError;
      }

      return coachesData.map(coach => ({
        ...coach,
        badges: coach.coach_badges?.map(cb => cb.coaching_badges) || []
      }));
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coaches</h1>
        <AddEditCoachDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coaches?.map((coach) => (
          <Card key={coach.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{coach.name}</h3>
                <p className="text-sm text-muted-foreground">{coach.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">{coach.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {coach.is_admin && (
                  <Shield className="h-5 w-5 text-primary" />
                )}
                <AddEditCoachDialog 
                  coach={coach} 
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {coach.badges?.map((badge) => (
                <Badge key={badge.id} variant="secondary">
                  {badge.name}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};