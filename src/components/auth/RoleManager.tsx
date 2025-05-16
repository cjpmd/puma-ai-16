
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const RoleManager = () => {
  const { profile, addRole } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddRole = async (role: 'admin' | 'coach' | 'parent' | 'player' | 'globalAdmin') => {
    if (!profile) return;
    
    setIsAdding(true);
    try {
      const success = await addRole(role);
      if (!success) {
        toast({
          title: "Error",
          description: `Failed to add ${role} role`,
          variant: "destructive",
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Manage Your Roles
        </CardTitle>
        <CardDescription>
          Add additional roles to access different features of the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('coach')}
            disabled={isAdding || profile?.role === 'coach'}
          >
            {profile?.role === 'coach' ? 'Coach Role Added' : 'Add Coach Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('parent')}
            disabled={isAdding || profile?.role === 'parent'}
          >
            {profile?.role === 'parent' ? 'Parent Role Added' : 'Add Parent Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('player')}
            disabled={isAdding || profile?.role === 'player'}
          >
            {profile?.role === 'player' ? 'Player Role Added' : 'Add Player Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('admin')}
            disabled={isAdding || profile?.role === 'admin'}
          >
            {profile?.role === 'admin' ? 'Admin Role Added' : 'Add Admin Role'}
          </Button>
          <Button 
            variant="outline" 
            className="col-span-1 md:col-span-2"
            onClick={() => handleAddRole('globalAdmin')}
            disabled={isAdding || profile?.role === 'globalAdmin'}
          >
            {profile?.role === 'globalAdmin' ? 'Global Admin Role Added' : 'Add Global Admin Role'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
