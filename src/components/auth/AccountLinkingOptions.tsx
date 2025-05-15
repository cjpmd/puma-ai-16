
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParentCodeLinkingDialog } from "@/components/parents/ParentCodeLinkingDialog";
import { PlayerCodeLinkingDialog } from "@/components/players/PlayerCodeLinkingDialog";
import { useAuth } from "@/hooks/useAuth";
import { User, Users } from "lucide-react";

export const AccountLinkingOptions = () => {
  const { hasRole, profile } = useAuth();
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Link Your Account</CardTitle>
        <CardDescription>Connect your account to player profiles or your children's accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-medium">Parent Access</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Link your account to your child's player profile to view their progress and manage their account.
            </p>
            <ParentCodeLinkingDialog />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-medium">Player Access</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you a player? Link your account directly to your player profile to access your statistics and information.
            </p>
            <PlayerCodeLinkingDialog />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
