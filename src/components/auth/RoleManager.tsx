
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, UserRole } from "@/hooks/useAuth.tsx"; // Fixed import to .tsx extension
import { Shield, ExternalLink, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const RoleManager = () => {
  const auth = useAuth();
  const { profile, addRole, hasRole, switchRole } = auth;
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingGlobalAdmin, setIsAddingGlobalAdmin] = useState(false);
  const navigate = useNavigate();

  const handleAddRole = async (role: UserRole) => {
    if (!profile || !addRole) return;
    
    // Special handling for globalAdmin
    if (role === 'globalAdmin') {
      setIsAddingGlobalAdmin(true);
    } else {
      setIsAdding(true);
    }
    
    try {
      const success = await addRole(role);
      if (success) {
        toast({
          title: "Success",
          description: `Added ${role} role to your account`,
        });
        
        // If global admin role was added successfully, navigate to the global admin page
        if (role === 'globalAdmin') {
          console.log("Successfully added globalAdmin role, navigating to /global-admin");
          setTimeout(() => {
            if (switchRole) {
              switchRole('globalAdmin');
              navigate('/global-admin');
            }
          }, 500);
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to add ${role} role`,
          variant: "destructive",
        });
      }
    } finally {
      setIsAdding(false);
      if (role === 'globalAdmin') {
        setIsAddingGlobalAdmin(false);
      }
    }
  };

  const goToGlobalAdmin = () => {
    console.log("Navigating to global admin dashboard");
    if (switchRole) {
      switchRole('globalAdmin');
      navigate('/global-admin');
    }
  };
  
  // Manual override for development - actually forces access to global admin
  const forceGlobalAdminAccess = () => {
    console.log("Forcing access to Global Admin dashboard");
    navigate('/global-admin');
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
            disabled={isAdding || (hasRole && hasRole('coach'))}
          >
            {hasRole && hasRole('coach') ? 'Coach Role Added' : 'Add Coach Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('parent')}
            disabled={isAdding || (hasRole && hasRole('parent'))}
          >
            {hasRole && hasRole('parent') ? 'Parent Role Added' : 'Add Parent Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('player')}
            disabled={isAdding || (hasRole && hasRole('player'))}
          >
            {hasRole && hasRole('player') ? 'Player Role Added' : 'Add Player Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('admin')}
            disabled={isAdding || (hasRole && hasRole('admin'))}
          >
            {hasRole && hasRole('admin') ? 'Admin Role Added' : 'Add Admin Role'}
          </Button>
          <Button 
            variant={(hasRole && hasRole('globalAdmin')) ? "outline" : "default"}
            className="col-span-1 md:col-span-2"
            onClick={() => !(hasRole && hasRole('globalAdmin')) && handleAddRole('globalAdmin')}
            disabled={isAddingGlobalAdmin}
          >
            {isAddingGlobalAdmin ? (
              <div className="flex items-center">
                <span className="mr-2">Adding Global Admin role...</span>
                <span className="animate-spin">⏳</span>
              </div>
            ) : (hasRole && hasRole('globalAdmin')) ? (
              <div className="flex items-center justify-between w-full">
                <span>Global Admin Role Added</span>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToGlobalAdmin();
                  }}
                  className="ml-2"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            ) : 'Add Global Admin Role'}
          </Button>
        </div>
        
        {hasRole && hasRole('globalAdmin') && (
          <Button 
            className="w-full"
            onClick={goToGlobalAdmin}
          >
            <Crown className="mr-2 h-4 w-4" />
            Access Global Admin Dashboard
          </Button>
        )}
        
        {/* Development/emergency access button */}
        <Button
          variant="outline"
          className="w-full border-dashed border-yellow-500 text-yellow-600 hover:bg-yellow-50"
          onClick={forceGlobalAdminAccess}
        >
          <span className="mr-2">⚠️</span>
          Force Access to Global Admin
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoleManager;
