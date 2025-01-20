import { FormationSelector } from "@/components/FormationSelector";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function FormationSelectorPage() {
  const { fixtureId } = useParams();
  
  const { data: fixture } = useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("id", fixtureId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!fixtureId
  });

  const { data: players } = useQuery({
    queryKey: ["players", fixture?.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("team_category", fixture?.category)
        .order("squad_number");

      if (error) throw error;
      return data || [];
    },
    enabled: !!fixture?.category
  });

  if (!fixture || !players) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Formation Selector</h1>
      <FormationSelector 
        players={players}
        fixtureId={fixtureId || ""}
        format={fixture.format || "7-a-side"}
      />
    </div>
  );
}