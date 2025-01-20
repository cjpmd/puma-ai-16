import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormationSelector } from "@/components/FormationSelector";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface TeamSelectionManagerProps {
  fixtureId: string;
  category: string;
}

export const TeamSelectionManager = ({ fixtureId, category }: TeamSelectionManagerProps) => {
  const [format, setFormat] = useState<string>("7-a-side");
  const { toast } = useToast();

  // Query fixture details including format
  const { data: fixture } = useQuery({
    queryKey: ["fixture", fixtureId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixtures")
        .select("*")
        .eq("id", fixtureId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching fixture:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch fixture details",
        });
        throw error;
      }

      return data;
    },
  });

  // Query players for the given category
  const { data: players } = useQuery({
    queryKey: ["players", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, squad_number")
        .eq("team_category", category)
        .order("squad_number", { ascending: true });

      if (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch players",
        });
        throw error;
      }

      console.log("Players data:", data);
      return data || [];
    },
  });

  // Update format when fixture data is loaded
  useEffect(() => {
    if (fixture?.format) {
      setFormat(fixture.format);
    }
  }, [fixture]);

  return (
    <div className="space-y-6">
      <FormationSelector
        players={players || []}
        fixtureId={fixtureId}
        format={format}
      />
    </div>
  );
};