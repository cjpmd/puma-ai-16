
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Database, AlertTriangle, Loader2, Info, WrenchIcon, KeyIcon } from "lucide-react";
import { toast } from "sonner";
import { 
  getSecurityDefinerViewsInfo, 
  setupSecurityPolicies,
  fixFunctionSearchPaths,
  fixMaterializedViewAccess,
  getAuthConfigurationInfo
} from "@/utils/database/setupSecurityPolicies";

export const AdminSettings = () => {
  const [isFixingRls, setIsFixingRls] = useState(false);
  const [isFixingFunctions, setIsFixingFunctions] = useState(false);
  const [isFixingViews, setIsFixingViews] = useState(false);
  const securityDefinerViews = getSecurityDefinerViewsInfo();
  const authConfigIssues = getAuthConfigurationInfo();
  
  const handleFixSecurityIssues = async () => {
    setIsFixingRls(true);
    try {
      const result = await setupSecurityPolicies();
      if (result) {
        toast.success("Database security policies have been updated successfully.");
      } else {
        toast.error("Failed to update some database security policies. Check console for details.");
      }
    } catch (error) {
      console.error("Error updating security policies:", error);
      toast.error("An unexpected error occurred while updating security policies.");
    } finally {
      setIsFixingRls(false);
    }
  };
  
  const handleFixFunctionSearchPaths = async () => {
    setIsFixingFunctions(true);
    try {
      const result = await fixFunctionSearchPaths();
      if (result) {
        toast.success("Function search paths have been fixed successfully.");
      } else {
        toast.error("Failed to fix some function search paths. Check console for details.");
      }
    } catch (error) {
      console.error("Error fixing function search paths:", error);
      toast.error("An unexpected error occurred while fixing function search paths.");
    } finally {
      setIsFixingFunctions(false);
    }
  };
  
  const handleFixMaterializedViews = async () => {
    setIsFixingViews(true);
    try {
      const result = await fixMaterializedViewAccess();
      if (result) {
        toast.success("Materialized view access permissions have been fixed.");
      } else {
        toast.error("Failed to fix materialized view permissions. Check console for details.");
      }
    } catch (error) {
      console.error("Error fixing materialized view access:", error);
      toast.error("An unexpected error occurred while fixing materialized view permissions.");
    } finally {
      setIsFixingViews(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Settings</h1>
      
      <Tabs defaultValue="security">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Database Security
              </CardTitle>
              <CardDescription>
                Manage Row Level Security (RLS) and permissions for database tables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Row Level Security (RLS) Issues</h3>
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>Security Issues Detected</AlertTitle>
                  <AlertDescription>
                    Some tables in your database do not have Row Level Security (RLS) enabled, 
                    which could expose sensitive data. Click the button below to fix these issues.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.club_plans</span>
                      <span className="text-sm text-muted-foreground">
                        Table is public, but RLS has not been enabled
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.team_plans</span>
                      <span className="text-sm text-muted-foreground">
                        Table is public, but RLS has not been enabled
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.user_roles</span>
                      <span className="text-sm text-muted-foreground">
                        Table is public, but RLS has not been enabled
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.parent_child_linking (+ 3 more)</span>
                      <span className="text-sm text-muted-foreground">
                        Additional tables without RLS enabled
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                
                <Button 
                  onClick={handleFixSecurityIssues} 
                  disabled={isFixingRls}
                >
                  {isFixingRls ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fixing RLS Issues...
                    </>
                  ) : (
                    'Fix RLS Security Issues'
                  )}
                </Button>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Function Search Path Issues</h3>
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>Function Search Path Warnings</AlertTitle>
                  <AlertDescription>
                    Several database functions have mutable search paths, which is a potential security risk.
                    Click the button below to fix these functions by setting explicit search paths.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.execute_sql</span>
                      <span className="text-sm text-muted-foreground">
                        Function has a role mutable search_path
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.is_club_admin, public.is_team_admin</span>
                      <span className="text-sm text-muted-foreground">
                        Security-critical functions with mutable search paths
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.add_column_if_not_exists (+ 15 more)</span>
                      <span className="text-sm text-muted-foreground">
                        Additional functions with mutable search paths
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                
                <Button 
                  onClick={handleFixFunctionSearchPaths} 
                  disabled={isFixingFunctions}
                  variant="outline"
                >
                  {isFixingFunctions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fixing Function Search Paths...
                    </>
                  ) : (
                    'Fix Function Search Paths'
                  )}
                </Button>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Materialized View Access Issues</h3>
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-5 w-5" />
                  <AlertTitle>Materialized View Access Warning</AlertTitle>
                  <AlertDescription>
                    The materialized view 'position_rankings' is accessible over the Data APIs by anonymous and authenticated users,
                    which may expose sensitive data or impact performance.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex flex-col">
                      <span className="font-medium">public.position_rankings</span>
                      <span className="text-sm text-muted-foreground">
                        Materialized view is selectable by anon or authenticated roles
                      </span>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                
                <Button 
                  onClick={handleFixMaterializedViews} 
                  disabled={isFixingViews}
                  variant="outline"
                >
                  {isFixingViews ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Fixing Materialized View Access...
                    </>
                  ) : (
                    'Fix Materialized View Access'
                  )}
                </Button>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Authentication Configuration Issues</h3>
                <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
                  <Info className="h-5 w-5 text-blue-500" />
                  <AlertTitle>Auth Configuration Warnings</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Your authentication configuration has some security warnings that need to be addressed in the Supabase dashboard.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 mb-6">
                  {authConfigIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{issue.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {issue.description}
                        </span>
                        <span className="text-xs text-blue-600 mt-1">
                          {issue.remediation}
                        </span>
                      </div>
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-3">Security Definer Views</h3>
                <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200">
                  <Info className="h-5 w-5 text-blue-500" />
                  <AlertTitle>Security Definer Views</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">
                      Your database has several views defined with the SECURITY DEFINER property, which bypasses RLS policies.
                      These views need to be manually recreated without SECURITY DEFINER to enforce proper security.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This typically requires database schema changes via SQL migrations. Check documentation for details.
                    </p>
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-2 mt-2">
                  {securityDefinerViews.map((view, index) => (
                    <div key={index} className="flex items-center justify-between rounded-md border p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">public.{view.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {view.description}
                        </span>
                      </div>
                      <Info className="h-5 w-5 text-blue-500" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="database" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                Manage database tables, columns, and maintenance tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Database management options will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                System settings options will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

