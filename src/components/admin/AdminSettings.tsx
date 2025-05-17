
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw, Database, Users, Shield } from "lucide-react";
import { initializeDatabase } from '@/utils/database/initializeDatabase';
import { setupTransferSystem } from '@/utils/database/transferSystem';
import { toast } from "sonner";

export function AdminSettings() {
  const [initializing, setInitializing] = useState(false);
  const [settingUpTransfers, setSettingUpTransfers] = useState(false);

  const handleInitializeDatabase = async () => {
    setInitializing(true);
    try {
      const result = await initializeDatabase();
      if (result) {
        toast.success("Database initialized successfully", {
          description: "Core database tables have been set up."
        });
      } else {
        toast.error("Database initialization failed", {
          description: "Please check console for errors."
        });
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      toast.error("Database error", {
        description: "An unexpected error occurred."
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleSetupTransferSystem = async () => {
    setSettingUpTransfers(true);
    try {
      const result = await setupTransferSystem();
      if (result) {
        toast.success("Transfer system set up successfully", {
          description: "Player transfer tables and columns have been created."
        });
      } else {
        toast.error("Transfer system setup failed", {
          description: "Please check console for errors."
        });
      }
    } catch (error) {
      console.error("Error setting up transfer system:", error);
      toast.error("Setup error", {
        description: "An unexpected error occurred."
      });
    } finally {
      setSettingUpTransfers(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Settings</h2>
        <p className="text-muted-foreground">
          Manage your application settings and database.
        </p>
      </div>
      
      <Tabs defaultValue="database">
        <TabsList>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="database" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Initialization</CardTitle>
              <CardDescription>
                Set up core database tables and functions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span>Core Tables</span>
                  <Badge>Required</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>SQL Functions</span>
                  <Badge>Required</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Roles</span>
                  <Badge>Required</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleInitializeDatabase}
                disabled={initializing}
                className="w-full"
              >
                {initializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Initialize Database
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Player Transfer System</CardTitle>
              <CardDescription>
                Set up player transfer tables and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span>Transfer Tables</span>
                  <Badge>Required</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Player Status Column</span>
                  <Badge>Required</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>RLS Policies</span>
                  <Badge>Required</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSetupTransferSystem}
                disabled={settingUpTransfers}
                className="w-full"
              >
                {settingUpTransfers ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Set Up Transfer System
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Settings</CardTitle>
              <CardDescription>
                Manage role-based permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Permission management features will be available soon.</p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Manage Permissions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>User management features will be available soon.</p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
