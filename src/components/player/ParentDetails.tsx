
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParentDetailsDialog } from "@/components/parents/ParentDetailsDialog";
import { supabase } from "@/integrations/supabase/client";

interface ParentDetailsProps {
  playerId: string;
}

export const ParentDetails = ({ playerId }: ParentDetailsProps) => {
  const [parents, setParents] = useState<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  }[]>([]);

  const fetchParentDetails = async () => {
    const { data, error } = await supabase
      .from('player_parents')
      .select('*')
      .eq('player_id', playerId);

    if (!error && data) {
      setParents(data);
    }
  };

  useEffect(() => {
    fetchParentDetails();
  }, [playerId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Parent Details</CardTitle>
        <ParentDetailsDialog
          playerId={playerId}
          existingParents={parents}
          onSave={fetchParentDetails}
        />
      </CardHeader>
      <CardContent>
        {parents.length > 0 ? (
          <div className="space-y-4">
            {parents.map(parent => (
              <div key={parent.id} className="space-y-2 border-b pb-3 last:border-b-0">
                <p><strong>Name:</strong> {parent.name}</p>
                {parent.email && <p><strong>Email:</strong> {parent.email}</p>}
                {parent.phone && <p><strong>Phone:</strong> {parent.phone}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No parent details added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};
