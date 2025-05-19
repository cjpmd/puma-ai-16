
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
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
import { Loader2, Copy, Check } from "lucide-react"
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { UserRole } from '@/hooks/useAuth';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
  last_sign_in_at?: string | null;
  team_id?: string | null;
  team_name?: string | null;
  club_id?: string | null;
  club_name?: string | null;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // Get directly from profiles instead of using the complex join
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        throw new Error(error.message)
      }

      // Transform the raw data into the User interface format
      const usersData = data.map(profile => ({
        id: profile.id,
        email: profile.email || '',
        role: profile.role as UserRole,
        name: profile.name || '',
        created_at: profile.created_at,
        // Set defaults for missing fields
        last_sign_in_at: null,
        team_id: null,
        team_name: null,
        club_id: profile.club_id || null,
        club_name: null,
      }));

      setUsers(usersData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const search = searchQuery.toLowerCase()
    return (
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    )
  })

  const handleRoleChange = (user: User) => {
    setSelectedUser(user)
    setRole(user.role)
    setIsDialogOpen(true)
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !role) return

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: role })
        .eq("id", selectedUser.id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Success",
        description: "User role updated successfully.",
      })
      fetchUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      setIsDialogOpen(false)
    }
  }

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      setCopySuccess(true)
      setTimeout(() => {
        setCopySuccess(false)
      }, 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy user ID",
        variant: "destructive",
      })
    }
  }

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
          <TableCaption>
            List of all registered users in your account.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRoleChange(user)}
                    >
                      Edit Role
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyId(user.id)}
                      className="ml-2 relative"
                      disabled={copySuccess}
                    >
                      {copySuccess ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy ID
                        </>
                      )}
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
                onValueChange={(value) => setRole(value as UserRole)}
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
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isUpdating}
            >
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
