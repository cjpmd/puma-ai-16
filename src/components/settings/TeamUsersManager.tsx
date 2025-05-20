
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Pencil, Trash2 } from "lucide-react";
import { UserAssignmentDialog } from "@/components/admin/UserAssignmentDialog";
import { mapStringToUserRole, AllowedUserRoles } from "./UserRoleAdapter";

// Simplify the interface to avoid circular references
interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface TeamUsersManagerProps {
  teamId: string;
}

export const TeamUsersManager = ({ teamId }: TeamUsersManagerProps) => {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (teamId) {
      fetchUsers();
    }
  }, [teamId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use a simple query to get team users
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, role, profiles:user_id (id, name, email)')
        .eq('team_id', teamId);

      if (error) throw error;

      // Transform the data into the simplified format
      const formattedUsers = data.map((item: any) => ({
        id: item.profiles?.id || '',
        email: item.profiles?.email || '',
        name: item.profiles?.name || 'Unknown User',
        role: item.role
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching team users:', error);
      toast({
        title: "Error",
        description: "Failed to load team users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (userId: string, role: AllowedUserRoles) => {
    try {
      // Convert the role enum to string if needed
      const roleString = role.toString();
      
      // Check if user already has a role in this team
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .single();

      if (existingRole) {
        // Update existing role
        await supabase
          .from('user_roles')
          .update({ role: roleString })
          .eq('id', existingRole.id);
      } else {
        // Create new role
        await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            team_id: teamId,
            role: roleString
          });
      }

      toast({
        description: "User role updated successfully"
      });
      
      fetchUsers();
      return true;
    } catch (error) {
      console.error('Error assigning user:', error);
      toast({
        title: "Error",
        description: "Failed to assign user role",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('team_id', teamId);

      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        description: "User removed from team"
      });
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user from team",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Team Users</CardTitle>
            <CardDescription>
              Manage users who have access to this team
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading users...</p>
        ) : users.length > 0 ? (
          <div className="space-y-3">
            {users.map(user => (
              <div key={user.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{user.role}</Badge>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveUser(user.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No users have been assigned to this team yet.</p>
        )}
      </CardContent>
      
      {/* Use a simplified prop structure for UserAssignmentDialog */}
      <UserAssignmentDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Assign User to Team"
        description="Search for a user and assign them a role in this team."
        onAssign={handleAssignUser}
      />
    </Card>
  );
};
