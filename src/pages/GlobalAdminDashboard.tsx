
import React, { useEffect } from 'react';
import { UserManagement } from '@/components/admin/UserManagement';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const GlobalAdminDashboard = () => {
  const { profile, user } = useAuth();

  useEffect(() => {
    // Log auth state for debugging
    console.log("Global Admin Dashboard - Auth state:", { profile, user });
  }, [profile, user]);

  // Ensure the profile exists and has the globalAdmin role
  if (!profile) {
    console.log("Global Admin Dashboard - No profile found, redirecting to home");
    return <Navigate to="/" />;
  }

  // Type guard to check if profile has role property
  const hasRoleProperty = (obj: any): obj is { role: string } => {
    return obj && typeof obj.role === 'string';
  };

  // Check if user has the globalAdmin role
  const isGlobalAdmin = hasRoleProperty(profile) && profile.role === 'globalAdmin';
  
  if (!isGlobalAdmin) {
    console.log("Global Admin Dashboard - Not a global admin, redirecting to home");
    return <Navigate to="/" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6"
    >
      <h1 className="text-3xl font-bold mb-8">Global Admin Dashboard</h1>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Global Subscription Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage subscription tiers and pricing for the platform
              </p>
              {/* Add subscription management components here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure global platform settings
              </p>
              {/* Add global settings components here */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default GlobalAdminDashboard;
