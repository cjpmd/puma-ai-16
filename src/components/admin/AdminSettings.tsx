
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
import { ShieldCheck, Database, AlertTriangle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { getSecurityDefinerViewsInfo, setupSecurityPolicies } from "@/utils/database/setupSecurityPolicies";

export const AdminSettings = () => {
  const [isFixingRls, setIsFixingRls] = useState(false);
  const securityDefinerViews = getSecurityDefinerViewsInfo();
  
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
            <CardContent>
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
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleFixSecurityIssues} 
                disabled={isFixingRls}
              >
                {isFixingRls ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fixing Security Issues...
                  </>
                ) : (
                  'Fix RLS Security Issues'
                )}
              </Button>
            </CardFooter>
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
