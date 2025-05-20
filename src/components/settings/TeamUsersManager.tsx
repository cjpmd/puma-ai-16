
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Team } from "@/types/team";
import { User } from "@/types/user";
import { UserRole } from "@/hooks/useAuth.tsx";

interface TeamUsersManagerProps {
  team?: Team;
}

// Define a type for team user roles that's compatible with the database
type ValidProfileRole = 'admin' | 'manager' | 'coach' | 'player' | 'parent' | 'user' | 'globalAdmin';

export const TeamUsersManager: React.FC<TeamUsersManagerProps> = ({ team }) => {
  const [teamUsers, setTeamUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<ValidProfileRole>("coach");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (team) {
      fetchTeamUsers();
    }
  }, [team]);

  const fetchTeamUsers = async () => {
    if (!team) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("team_id", team.id);

      if (error) {
        console.error("Error fetching team users:", error);
        toast("Failed to fetch team users", {
          description: "Could not load team users.",
        });
      } else {
        setTeamUsers(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!team) return;
    setLoading(true);
    try {
      // Check if the user with the given email exists
      const { data: existingUsers, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", newEmail);

      if (userError) {
        console.error("Error checking existing user:", userError);
        toast("Error checking user", {
          description: "Failed to check existing user.",
        });
        return;
      }

      if (existingUsers && existingUsers.length > 0) {
        // User exists, update their role and team_id
        const user = existingUsers[0];
        
        // Ensure the role is compatible with the database schema
        const dbRole = newRole as ValidProfileRole;
        
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            role: dbRole, 
            team_id: team.id 
          })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating user:", updateError);
          toast("Error updating user", {
            description: "Failed to update user.",
          });
        } else {
          toast("Success", {
            description: "User added to team successfully.",
          });
          fetchTeamUsers(); // Refresh user list
        }
      } else {
        // User does not exist, show an error message
        toast("User not found", {
          description:
            "User with this email does not exist. Please invite them to create an account first.",
        });
      }
    } catch (error) {
      console.error("Error adding user to team:", error);
      toast("Error adding user", {
        description: "Failed to add user to team.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setLoading(true);
    try {
      // Set a default role that's compatible with the database
      const defaultRole: ValidProfileRole = 'user';
      
      const { error } = await supabase
        .from("profiles")
        .update({ team_id: null, role: defaultRole })
        .eq("id", userId);

      if (error) {
        console.error("Error removing user:", error);
        toast("Error removing user", {
          description: "Failed to remove user from team.",
        });
      } else {
        toast("User removed", {
          description: "User removed from team successfully.",
        });
        fetchTeamUsers(); // Refresh user list
      }
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return <div>No team selected</div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Manage Team Users</h2>

      {/* Add User Form */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Add New User</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="user@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={newRole} onValueChange={(value) => setNewRole(value as ValidProfileRole)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddUser} disabled={loading}>
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Team Users Table */}
      <div>
        <h3 className="text-md font-semibold mb-2">Current Team Users</h3>
        <Table>
          <TableCaption>A list of users currently in your team.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
                      <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.full_name || user.email}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveUser(user.id)}
                    disabled={loading}
                  >
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamUsersManager;
