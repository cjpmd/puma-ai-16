import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { UserManagement } from '@/components/admin/UserManagement';
import { TeamManagement } from '@/components/admin/TeamManagement';
import { ClubManagement } from '@/components/admin/ClubManagement';
import { PlatformSettings } from '@/components/admin/PlatformSettings';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';
import { FinancialReports } from '@/components/admin/FinancialReports';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GlobalAdminDashboard = () => {
  const { profile, isLoading, hasRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [bypassAccess, setBypassAccess] = useState(true); // Default to bypass for testing

  useEffect(() => {
    // Only check role if we're not bypassing access
    if (!bypassAccess && !isLoading && profile) {
      console.log("GlobalAdminDashboard: Checking user role:", profile.role);
      if (!hasRole('globalAdmin')) {
        console.log("User does not have globalAdmin role, redirecting");
        navigate('/platform');
      }
    }
  }, [profile, isLoading, hasRole, navigate, bypassAccess]);

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Global Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage all platform users, teams, clubs, settings, and subscriptions
        </p>
        
        {bypassAccess && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Access restrictions have been temporarily disabled for testing purposes.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="bg-background sticky top-0 z-10 py-2">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="clubs">Clubs</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                View and manage all teams on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Club Management</CardTitle>
              <CardDescription>
                View and manage all clubs on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClubManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure global platform settings including APIs and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>
                Manage all user and team subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial & Platform Reports</CardTitle>
              <CardDescription>
                View reports on platform usage, finances, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinancialReports />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalAdminDashboard;
