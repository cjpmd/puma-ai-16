import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParentDetailsDialog } from "@/components/parents/ParentDetailsDialog";
import { supabase } from "@/integrations/supabase/client";

interface ParentDetailsProps {
  playerId: string;
}

export const ParentDetails = ({ playerId }: ParentDetailsProps) => {
  const [parentDetails, setParentDetails] = useState<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null>(null);

  const fetchParentDetails = async () => {
    const { data, error } = await supabase
      .from('player_parents')
      .select('*')
      .eq('player_id', playerId)
      .maybeSingle();

    if (!error && data) {
      setParentDetails(data);
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
          existingParent={parentDetails || undefined}
          onSave={fetchParentDetails}
        />
      </CardHeader>
      <CardContent>
        {parentDetails ? (
          <div className="space-y-2">
            <p><strong>Name:</strong> {parentDetails.name}</p>
            {parentDetails.email && <p><strong>Email:</strong> {parentDetails.email}</p>}
            {parentDetails.phone && <p><strong>Phone:</strong> {parentDetails.phone}</p>}
          </div>
        ) : (
          <p className="text-muted-foreground">No parent details added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};