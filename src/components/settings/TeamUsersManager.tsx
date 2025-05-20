
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, RefreshCcw, MapPin, User, Mail, Edit, UserPlus } from "lucide-react";
import { UserAssignmentDialog } from "@/components/admin/UserAssignmentDialog";
import { AllowedUserRoles } from "@/types/teamSettings";
import { useQuery } from "@tanstack/react-query";

interface TeamUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  club_id?: string;
  team_id?: string;
}

interface TeamUsersManagerProps {
  teamId?: string;
}

export const TeamUsersManager = ({ teamId }: TeamUsersManagerProps) => {
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch team users
  const { 
    data: users, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["team-users"],
    queryFn: async () => {
      // In a real app, you'd filter by teamId
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as TeamUser[];
    }
  });

  const handleAssignUserToTeam = async (userId: string, role: AllowedUserRoles) => {
    try {
      // Update user role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      
      refetch();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not update user role",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleOpenAssignDialog = (user: TeamUser) => {
    setSelectedUser(user);
    setIsAssignDialogOpen(true);
  };

  const handleAddNewUser = () => {
    setIsAddUserOpen(true);
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800";
      case 'coach':
        return "bg-blue-100 text-blue-800";
      case 'parent':
        return "bg-green-100 text-green-800";
      case 'player':
        return "bg-purple-100 text-purple-800";
      case 'globalAdmin':
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Users</CardTitle>
          <CardDescription>
            There was an error loading team users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Team Users</CardTitle>
          <CardDescription>
            Manage users and their roles in your team
          </CardDescription>
        </div>
        <Button onClick={handleAddNewUser} className="flex items-center">
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name || "Unnamed User"}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Mail className="mr-1 h-3 w-3" />
                          {user.email || "No email"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.team_id ? (
                        <span className="flex items-center text-sm">
                          <MapPin className="mr-1 h-3 w-3" />
                          {user.team_id}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No team</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleOpenAssignDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <User className="h-8 w-8 text-muted-foreground mb-2" />
                      <p>No users found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* User Assignment Dialog */}
      {selectedUser && (
        <UserAssignmentDialog
          open={isAssignDialogOpen}
          onOpenChange={setIsAssignDialogOpen}
          user={selectedUser}
          onSuccess={() => refetch()}
        />
      )}
    </Card>
  );
};
