
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParentDetailsDialog } from "@/components/parents/ParentDetailsDialog";
import { ParentSubscriptionManager } from "@/components/parents/ParentSubscriptionManager";
import { PlayerLinkingCodeManager } from "@/components/parents/PlayerLinkingCodeManager"; 
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard, Key } from "lucide-react";

interface ParentDetailsProps {
  playerId: string;
  playerName?: string; // Add optional player name prop
}

export const ParentDetails = ({ playerId, playerName = "this player" }: ParentDetailsProps) => {
  const [parents, setParents] = useState<{
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchParentDetails = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_parents')
        .select('*')
        .eq('player_id', playerId);

      if (error) {
        console.error('Error fetching parents:', error);
        toast({
          variant: "destructive",
          description: "Failed to load parent details",
        });
      } else {
        setParents(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch parents:", error);
      toast({
        variant: "destructive",
        description: "An unexpected error occurred while loading parent details",
      });
    } finally {
      setIsLoading(false);
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
        <Tabs defaultValue="details">
          <TabsList className="mb-4">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              <span>Subscription</span>
            </TabsTrigger>
            <TabsTrigger value="linking" className="flex items-center gap-1">
              <Key className="h-4 w-4" />
              <span>Linking Code</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-pulse rounded-md bg-slate-200 h-24 w-full"></div>
              </div>
            ) : parents.length > 0 ? (
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
          </TabsContent>
          
          <TabsContent value="subscription">
            <ParentSubscriptionManager playerId={playerId} />
          </TabsContent>
          
          <TabsContent value="linking">
            <PlayerLinkingCodeManager playerId={playerId} playerName={playerName} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
