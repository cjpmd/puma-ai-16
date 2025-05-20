
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UserAssignmentDialog } from "@/components/admin/UserAssignmentDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AllowedUserRoles } from "@/types/teamSettings";
import { useAuth } from "@/hooks/useAuth.tsx";

type TeamUser = {
  id: string;
  name: string;
  role: AllowedUserRoles;
  email?: string;
};

export interface TeamUsersManagerProps {
  teamId: string;
  teamName?: string;
}

export const TeamUsersManager = ({ teamId, teamName }: TeamUsersManagerProps) => {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const auth = useAuth();

  const fetchTeamUsers = async () => {
    setLoading(true);
    try {
      // First get the profiles that have this team_id assigned
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, role")
        .eq("team_id", teamId);

      if (error) throw error;
      
      // Simple mapping to avoid deep type instantiation issues
      const formattedUsers = data.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as AllowedUserRoles
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching team users:", error);
      toast({
        title: "Error",
        description: "Could not load team users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userId: string, role: AllowedUserRoles) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          team_id: teamId,
          role: role as string, // Cast to string to avoid type errors
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User added to team successfully",
      });
      
      fetchTeamUsers();
    } catch (error) {
      console.error("Error adding user to team:", error);
      toast({
        title: "Error",
        description: "Failed to add user to team",
        variant: "destructive",
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          team_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User removed from team successfully",
      });
      
      fetchTeamUsers();
    } catch (error) {
      console.error("Error removing user from team:", error);
      toast({
        title: "Error",
        description: "Failed to remove user from team",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, role: AllowedUserRoles) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: role as string, // Cast to string to avoid type errors
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      fetchTeamUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchTeamUsers();
    }
  }, [teamId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Users</CardTitle>
        <Button 
          onClick={() => setIsDialogOpen(true)} 
          size="sm" 
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{user.role}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No users added to this team yet
              </p>
            )}
          </div>
        )}
      </CardContent>
      <UserAssignmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAssign={handleAddUser}
        title={`Add User to ${teamName || "Team"}`}
        description="Assign a user to this team and set their role"
      />
    </Card>
  );
};
