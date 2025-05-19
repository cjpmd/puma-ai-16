import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Update the type to include 'player' role
type AllowedUserRoles = 'admin' | 'manager' | 'coach' | 'parent' | 'player' | 'globalAdmin' | 'user';

// Use the updated type in the interface
interface TeamUser {
  id: string;
  email: string;
  role: AllowedUserRoles;
  name: string;
  last_sign_in_at: any;
  created_at: string;
  team_id: string | null;
  team_name: string | null;
  club_id: string | null;
  club_name: string | null;
}

export function TeamUsersManager() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null)
  const [role, setRole] = useState<AllowedUserRoles | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  // When fetching user data, ensure the role is properly typed
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        throw new Error(error.message);
      }

      // Transform the raw data to match the TeamUser interface
      const usersData: TeamUser[] = data.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        role: profile.role as AllowedUserRoles,  // Cast the role to the allowed roles type
        name: profile.name || '',
        created_at: profile.created_at,
        last_sign_in_at: null,
        team_id: null,
        team_name: null,
        club_id: profile.club_id || null,
        club_name: null,
      }));

      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    )
  })

  const handleRoleChange = (user: TeamUser) => {
    setSelectedUser(user)
    setRole(user.role)
    setIsDialogOpen(true)
  }

  // When updating roles, use the string type
  const handleUpdateRole = async () => {
    if (!selectedUser || !role) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: role })
        .eq("id", selectedUser.id);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setIsDialogOpen(false);
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'coach', label: 'Coach' },
    { value: 'parent', label: 'Parent' },
    { value: 'player', label: 'Player' },
    { value: 'globalAdmin', label: 'Global Admin' },
    { value: 'user', label: 'User' }
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleChange(user)}
                    >
                      Edit Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Select a new role for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role-select">Role</Label>
              <Select
                value={role || undefined}
                onValueChange={(value) => setRole(value as AllowedUserRoles)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleUpdateRole} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Role
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
