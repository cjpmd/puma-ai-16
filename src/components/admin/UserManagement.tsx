
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/hooks/useAuth.tsx"; // Fixed import to .tsx extension

interface Profile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export const UserManagement = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("admin");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, role");

      if (error) {
        console.error("Error fetching profiles:", error);
        toast("Failed to load user profiles", {
          description: error.message,
        });
      } else {
        setProfiles(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching profiles:", error);
      toast("An unexpected error occurred", {
        description: "Could not load user profiles.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id);

      if (error) {
        console.error("Error updating role:", error);
        toast("Failed to update user role", {
          description: error.message,
        });
      } else {
        setProfiles((prevProfiles) =>
          prevProfiles.map((profile) =>
            profile.id === id ? { ...profile, role } : profile
          )
        );
        toast("User role updated successfully");
      }
    } catch (error) {
      console.error("Unexpected error updating role:", error);
      toast("An unexpected error occurred", {
        description: "Could not update user role.",
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      // Create user in Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email: newEmail,
        password: "defaultpassword", // You might want to handle password creation differently
        options: {
          data: {
            role: newRole, // Set the role in user metadata
          },
        },
      });

      if (error) {
        console.error("Error creating user:", error);
        toast("Failed to create user", {
          description: error.message,
        });
        return;
      }

      // Get the user ID from the auth.users table
      const userId = data.user?.id;

      if (!userId) {
        console.error("User ID not found after signup");
        toast("Failed to retrieve user ID after signup");
        return;
      }

      // Create profile in the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId, 
          email: newEmail, 
          role: newRole,
          name: newEmail // Add the name field with email as default
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        toast("Failed to create user profile", {
          description: profileError.message,
        });

        // Optionally, delete the user from auth.users if profile creation fails
        await supabase.auth.admin.deleteUser(userId);
        return;
      }

      // Fetch profiles to update the list
      await fetchProfiles();

      // Reset input fields
      setNewEmail("");
      setNewRole("admin");

      toast("User created successfully");
    } catch (error: any) {
      console.error("Unexpected error creating user:", error);
      toast("An unexpected error occurred", {
        description: "Could not create user.",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Create User Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Enter email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => setNewRole(value as UserRole)} value={newRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="player">Player</SelectItem>
                <SelectItem value="globalAdmin">Global Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleCreateUser} className="mt-4">
          Create User
        </Button>
      </div>

      {/* User List Table */}
      <div>
        <h2 className="text-xl font-semibold mb-2">User List</h2>
        {loading ? (
          <div>Loading profiles...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.id}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Select
                        value={profile.role}
                        onValueChange={(value) =>
                          handleRoleChange(profile.id, value as UserRole)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="coach">Coach</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="player">Player</SelectItem>
                          <SelectItem value="globalAdmin">Global Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        onClick={() =>
                          alert(`Implement delete functionality for ${profile.email}`)
                        }
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

// Add default export to maintain backward compatibility
export default UserManagement;
