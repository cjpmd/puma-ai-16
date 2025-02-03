import { FormationSelector } from "@/components/FormationSelector";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function FormationSelectorPage() {
  const { data: players } = useQuery({
    queryKey: ["all-players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order('name');
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Formation Selector</h1>
      <FormationSelector 
        format="7-a-side"
        teamName="Default Team"
        onSelectionChange={() => {}}
        selectedPlayers={new Set()}
        availablePlayers={players || []}
      />
    </div>
  );
}