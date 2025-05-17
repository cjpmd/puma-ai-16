
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Shield, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const RoleManager = () => {
  const { profile, addRole, hasRole, switchRole } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  const handleAddRole = async (role: 'admin' | 'coach' | 'parent' | 'player' | 'globalAdmin') => {
    if (!profile) return;
    
    setIsAdding(true);
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
            switchRole('globalAdmin');
            navigate('/global-admin');
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
    }
  };

  const goToGlobalAdmin = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent button's onClick
    console.log("Navigating to global admin dashboard");
    switchRole('globalAdmin');
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
            disabled={isAdding || hasRole('coach')}
          >
            {hasRole('coach') ? 'Coach Role Added' : 'Add Coach Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('parent')}
            disabled={isAdding || hasRole('parent')}
          >
            {hasRole('parent') ? 'Parent Role Added' : 'Add Parent Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('player')}
            disabled={isAdding || hasRole('player')}
          >
            {hasRole('player') ? 'Player Role Added' : 'Add Player Role'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddRole('admin')}
            disabled={isAdding || hasRole('admin')}
          >
            {hasRole('admin') ? 'Admin Role Added' : 'Add Admin Role'}
          </Button>
          <Button 
            variant={hasRole('globalAdmin') ? "outline" : "default"}
            className="col-span-1 md:col-span-2"
            onClick={() => !hasRole('globalAdmin') && handleAddRole('globalAdmin')}
            disabled={isAdding}
          >
            {hasRole('globalAdmin') ? (
              <div className="flex items-center justify-between w-full">
                <span>Global Admin Role Added</span>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={goToGlobalAdmin}
                  className="ml-2"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            ) : 'Add Global Admin Role'}
          </Button>
        </div>
        {hasRole('globalAdmin') && (
          <Button 
            className="w-full"
            onClick={() => navigate('/global-admin')}
          >
            Access Global Admin Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
