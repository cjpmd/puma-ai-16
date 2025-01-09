import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, X } from "lucide-react";

export const Coaches = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: coach } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return coach;
    },
  });

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch coaches",
        });
        return [];
      }

      return data;
    },
  });

  const approveCoachMutation = useMutation({
    mutationFn: async ({ coachId, approved }: { coachId: string; approved: boolean }) => {
      const { error } = await supabase
        .from("coaches")
        .update({ is_approved: approved })
        .eq("id", coachId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast({
        title: "Success",
        description: "Coach status updated successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update coach status",
      });
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Coaches</h1>
        {currentProfile?.is_admin && (
          <p className="text-muted-foreground mt-2">
            As an admin, you can approve or reject coach applications
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coaches?.map((coach) => (
          <Card key={coach.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{coach.name}</h3>
                <p className="text-sm text-muted-foreground">{coach.role}</p>
              </div>
              {coach.is_admin && (
                <Shield className="h-5 w-5 text-primary" />
              )}
            </div>
            
            {currentProfile?.is_admin && !coach.is_admin && (
              <div className="mt-4 flex gap-2">
                {!coach.is_approved ? (
                  <Button
                    onClick={() => approveCoachMutation.mutate({ coachId: coach.id, approved: true })}
                    size="sm"
                    className="w-full"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    onClick={() => approveCoachMutation.mutate({ coachId: coach.id, approved: false })}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Revoke Access
                  </Button>
                )}
              </div>
            )}

            <div className="mt-2">
              <span className={`text-sm ${
                coach.is_approved ? "text-success" : "text-destructive"
              }`}>
                {coach.is_approved ? "Approved" : "Pending Approval"}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};