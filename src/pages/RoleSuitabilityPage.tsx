import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RoleSuitabilityRankings } from "@/components/RoleSuitabilityRankings";

const RoleSuitabilityPage = () => {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_definitions")
        .select("*")
        .order("abbreviation");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading roles...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Role Suitability Rankings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {roles?.map((role) => (
          <RoleSuitabilityRankings key={role.id} roleId={role.id} />
        ))}
      </div>
    </div>
  );
};

export default RoleSuitabilityPage;