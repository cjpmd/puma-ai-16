
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Plus } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const RoleManager = () => {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [roleToAdd, setRoleToAdd] = useState<UserRole>("coach");
  const { profile, addRole } = useAuth();
  
  // Function to add a role
  const handleAddRole = async (role: UserRole) => {
    if (addRole) {
      const success = await addRole(role);
      if (success) {
        setShowRoleDialog(false);
      }
    }
  };

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setShowRoleDialog(true)}>
        <Shield className="h-4 w-4" />
        Manage Roles
      </Button>
      
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              Add or view roles associated with your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-2">Current Roles:</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {profile?.role && (
                <Badge key={profile.role} variant="outline">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              )}
              {(!profile?.role) && (
                <span className="text-muted-foreground text-sm">No roles assigned</span>
              )}
            </div>
            
            <h3 className="font-medium mb-2">Add Role:</h3>
            <div className="grid gap-4">
              <Select 
                value={roleToAdd} 
                onValueChange={(value) => setRoleToAdd(value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleAddRole(roleToAdd)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
