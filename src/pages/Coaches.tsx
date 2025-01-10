import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, X, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type CoachRole = Database["public"]["Enums"]["coach_role"];

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
      const { data: coachesData, error: coachesError } = await supabase
        .from("coaches")
        .select("*, coach_badges(badge_id)");

      if (coachesError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch coaches",
        });
        return [];
      }

      const { data: badges } = await supabase
        .from("coaching_badges")
        .select("id, name");

      return coachesData.map(coach => ({
        ...coach,
        badges: badges?.filter(badge => 
          coach.coach_badges?.some(cb => cb.badge_id === badge.id)
        ) || []
      }));
    },
  });

  const { data: availableBadges } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coaching_badges")
        .select("*")
        .order("name");

      if (error) throw error;
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

  const updateRoleMutation = useMutation({
    mutationFn: async ({ coachId, role }: { coachId: string; role: CoachRole }) => {
      const { error } = await supabase
        .from("coaches")
        .update({ role })
        .eq("id", coachId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast({
        title: "Success",
        description: "Coach role updated successfully",
      });
    },
  });

  const updateBadgesMutation = useMutation({
    mutationFn: async ({ coachId, badgeIds }: { coachId: string; badgeIds: string[] }) => {
      // First remove all existing badges
      await supabase
        .from("coach_badges")
        .delete()
        .eq("coach_id", coachId);

      // Then add the new ones
      const badgesToAdd = badgeIds.map(badgeId => ({
        coach_id: coachId,
        badge_id: badgeId,
      }));

      if (badgesToAdd.length > 0) {
        const { error } = await supabase
          .from("coach_badges")
          .insert(badgesToAdd);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaches"] });
      toast({
        title: "Success",
        description: "Coach badges updated successfully",
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
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-muted-foreground">{coach.role}</p>
                  {currentProfile?.is_admin && (
                    <Select
                      defaultValue={coach.role}
                      onValueChange={(value: CoachRole) => 
                        updateRoleMutation.mutate({ coachId: coach.id, role: value })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Coach">Coach</SelectItem>
                        <SelectItem value="Helper">Helper</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              {coach.is_admin && (
                <Shield className="h-5 w-5 text-primary" />
              )}
            </div>

            <div className="mt-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Award className="w-4 h-4 mr-2" />
                    Manage Badges
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Coaching Badges</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[300px] mt-4">
                    <div className="space-y-4">
                      {availableBadges?.map((badge) => (
                        <div key={badge.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={badge.id}
                            checked={coach.badges?.some(b => b.id === badge.id)}
                            onCheckedChange={(checked) => {
                              const currentBadges = coach.badges?.map(b => b.id) || [];
                              const newBadges = checked
                                ? [...currentBadges, badge.id]
                                : currentBadges.filter(id => id !== badge.id);
                              updateBadgesMutation.mutate({
                                coachId: coach.id,
                                badgeIds: newBadges,
                              });
                            }}
                          />
                          <label
                            htmlFor={badge.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {badge.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {coach.badges?.map((badge) => (
                <Badge key={badge.id} variant="secondary">
                  {badge.name}
                </Badge>
              ))}
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
                coach.is_approved ? "text-green-600" : "text-red-600"
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