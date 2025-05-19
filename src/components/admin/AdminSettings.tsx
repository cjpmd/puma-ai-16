import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge"; // Added for showing counts
import { ClubManagement } from "./ClubManagement";
import { TeamManagement } from "./TeamManagement";
import { UserManagement } from "./UserManagement";
import { SubscriptionManagement } from "./SubscriptionManagement";
import { PlatformSettings } from "./PlatformSettings";
import { FinancialReports } from "./FinancialReports";
import { AlertTriangle, CheckCircle, Database, Lock, RefreshCw, Shield, User, Users, Workflow, Info, Index } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { 
  setupSecurityPolicies, 
  getSecurityDefinerViewsInfo, 
  fixFunctionSearchPaths,
  fixMaterializedViewAccess,
  getAuthConfigurationInfo,
  optimizeRlsPolicies,
  consolidatePermissivePolicies,
  getPermissivePoliciesCount,
  getUnindexedForeignKeysCount,
  getUnindexedForeignKeysInfo,
  createIndexesForForeignKeys,
  fixDuplicateIndexes,
  getDuplicateIndexesCount,
  getDuplicateIndexesInfo
} from "@/utils/database/setupSecurityPolicies";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function AdminSettings() {
  const { toast } = useToast();
  const [isEnablingRls, setIsEnablingRls] = useState(false);
  const [isFixingSearchPaths, setIsFixingSearchPaths] = useState(false);
  const [isFixingViewAccess, setIsFixingViewAccess] = useState(false);
  const [isOptimizingRls, setIsOptimizingRls] = useState(false);
  const [isConsolidatingPolicies, setIsConsolidatingPolicies] = useState(false);
  const [isCreatingIndexes, setIsCreatingIndexes] = useState(false);
  const [isFixingDuplicateIndexes, setIsFixingDuplicateIndexes] = useState(false);
  const [permissivePolicyCount, setPermissivePolicyCount] = useState<number>(0);
  const [unindexedForeignKeyCount, setUnindexedForeignKeyCount] = useState<number>(0);
  const [duplicateIndexCount, setDuplicateIndexCount] = useState<number>(0);

  const securityDefinerViews = getSecurityDefinerViewsInfo();
  const authConfigIssues = getAuthConfigurationInfo();

  // Fetch database issue counts on component mount
  useEffect(() => {
    const fetchDatabaseIssues = async () => {
      // Fetch permissive policy count
      const policyCount = await getPermissivePoliciesCount();
      setPermissivePolicyCount(policyCount);
      
      // Fetch unindexed foreign key count
      const keyCount = await getUnindexedForeignKeysCount();
      setUnindexedForeignKeyCount(keyCount);
      
      // Fetch duplicate index count
      const indexCount = await getDuplicateIndexesCount();
      setDuplicateIndexCount(indexCount);
    };
    
    fetchDatabaseIssues();
  }, []);

  const handleEnableRls = async () => {
    setIsEnablingRls(true);
    try {
      const success = await setupSecurityPolicies();
      
      if (success) {
        toast({
          title: "Security Policies Applied",
          description: "Row-level security policies have been successfully applied to tables",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Security Policy Error",
          description: "There was an issue applying security policies, check console for details",
        });
      }
    } catch (error) {
      console.error("Error enabling RLS:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while enabling RLS",
      });
    } finally {
      setIsEnablingRls(false);
    }
  };

  const handleFixSearchPaths = async () => {
    setIsFixingSearchPaths(true);
    try {
      const success = await fixFunctionSearchPaths();
      
      if (success) {
        toast({
          title: "Search Paths Fixed",
          description: "Database function search paths have been successfully fixed",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Search Path Fix Error",
          description: "There was an issue fixing function search paths, check console for details",
        });
      }
    } catch (error) {
      console.error("Error fixing search paths:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fixing function search paths",
      });
    } finally {
      setIsFixingSearchPaths(false);
    }
  };

  const handleFixViewAccess = async () => {
    setIsFixingViewAccess(true);
    try {
      const success = await fixMaterializedViewAccess();
      
      if (success) {
        toast({
          title: "View Access Fixed",
          description: "Materialized view access permissions have been successfully fixed",
        });
      } else {
        toast({
          variant: "destructive",
          title: "View Access Fix Error",
          description: "There was an issue fixing materialized view access, check console for details",
        });
      }
    } catch (error) {
      console.error("Error fixing view access:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fixing materialized view access",
      });
    } finally {
      setIsFixingViewAccess(false);
    }
  };

  const handleOptimizeRls = async () => {
    setIsOptimizingRls(true);
    try {
      const success = await optimizeRlsPolicies();
      
      if (success) {
        toast({
          title: "RLS Policies Optimized",
          description: "RLS policies have been successfully optimized for better performance",
        });
      } else {
        toast({
          variant: "destructive",
          title: "RLS Optimization Error",
          description: "There was an issue optimizing RLS policies, check console for details",
        });
      }
    } catch (error) {
      console.error("Error optimizing RLS policies:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while optimizing RLS policies",
      });
    } finally {
      setIsOptimizingRls(false);
    }
  };

  const handleConsolidatePolicies = async () => {
    setIsConsolidatingPolicies(true);
    try {
      const success = await consolidatePermissivePolicies();
      
      if (success) {
        toast({
          title: "Policies Consolidated",
          description: "Multiple permissive policies have been successfully consolidated",
        });
        
        // Update count after consolidation
        const updatedCount = await getPermissivePoliciesCount();
        setPermissivePolicyCount(updatedCount);
      } else {
        toast({
          variant: "destructive",
          title: "Policy Consolidation Error",
          description: "There was an issue consolidating policies, check console for details",
        });
      }
    } catch (error) {
      console.error("Error consolidating policies:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while consolidating policies",
      });
    } finally {
      setIsConsolidatingPolicies(false);
    }
  };

  const handleCreateIndexes = async () => {
    setIsCreatingIndexes(true);
    try {
      const success = await createIndexesForForeignKeys();
      
      if (success) {
        toast({
          title: "Indexes Created",
          description: "Missing indexes for foreign keys have been successfully created",
        });
        
        // Update count after creating indexes
        const updatedCount = await getUnindexedForeignKeysCount();
        setUnindexedForeignKeyCount(updatedCount);
      } else {
        toast({
          variant: "destructive",
          title: "Index Creation Error",
          description: "There was an issue creating indexes, check console for details",
        });
      }
    } catch (error) {
      console.error("Error creating indexes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while creating indexes",
      });
    } finally {
      setIsCreatingIndexes(false);
    }
  };

  const handleFixDuplicateIndexes = async () => {
    setIsFixingDuplicateIndexes(true);
    try {
      const success = await fixDuplicateIndexes();
      
      if (success) {
        toast({
          title: "Duplicate Indexes Fixed",
          description: "Duplicate indexes have been successfully removed",
        });
        
        // Update count after fixing duplicate indexes
        const updatedCount = await getDuplicateIndexesCount();
        setDuplicateIndexCount(updatedCount);
      } else {
        toast({
          variant: "destructive",
          title: "Duplicate Index Fix Error",
          description: "There was an issue fixing duplicate indexes, check console for details",
        });
      }
    } catch (error) {
      console.error("Error fixing duplicate indexes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fixing duplicate indexes",
      });
    } finally {
      setIsFixingDuplicateIndexes(false);
    }
  };

  return (
    <Tabs defaultValue="clubs">
      <TabsList className="grid grid-cols-7 mb-4">
        <TabsTrigger value="clubs">Clubs</TabsTrigger>
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        <TabsTrigger value="platform">Platform</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="clubs">
        <ClubManagement />
      </TabsContent>

      <TabsContent value="teams">
        <TeamManagement />
      </TabsContent>

      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="subscriptions">
        <SubscriptionManagement />
      </TabsContent>

      <TabsContent value="platform">
        <PlatformSettings />
      </TabsContent>

      <TabsContent value="financial">
        <FinancialReports />
      </TabsContent>

      <TabsContent value="security">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Database Security Configuration
              </CardTitle>
              <CardDescription>
                Fix security warnings and implement best practices for your database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* RLS Disabled on Tables */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  RLS Disabled on Tables
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Some tables don't have Row Level Security (RLS) enabled, which can lead to unauthorized data access.
                </p>
                <Button 
                  onClick={handleEnableRls}
                  disabled={isEnablingRls}
                  className="gap-2"
                >
                  {isEnablingRls ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enabling RLS...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Enable RLS on Tables
                    </>
                  )}
                </Button>
              </div>

              {/* Function Search Path Issues */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Function Search Path Mutable
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Some database functions have mutable search paths, which can lead to security vulnerabilities.
                </p>
                <Button 
                  onClick={handleFixSearchPaths}
                  disabled={isFixingSearchPaths}
                  className="gap-2"
                >
                  {isFixingSearchPaths ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Fixing Search Paths...
                    </>
                  ) : (
                    <>
                      <Workflow className="h-4 w-4" />
                      Fix Function Search Paths
                    </>
                  )}
                </Button>
              </div>

              {/* Materialized View Access Issues */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Materialized View in API
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Materialized views are accessible to anon and authenticated roles, which may expose sensitive data.
                </p>
                <Button 
                  onClick={handleFixViewAccess}
                  disabled={isFixingViewAccess}
                  className="gap-2"
                >
                  {isFixingViewAccess ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Fixing View Access...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Fix View Access Controls
                    </>
                  )}
                </Button>
              </div>

              {/* RLS Performance Issues - Auth Initialization Plan */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Auth RLS Initialization Plan
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Some RLS policies use direct auth.uid() calls, which causes performance issues at scale.
                  Fix by replacing with (SELECT auth.uid()).
                </p>
                <Button 
                  onClick={handleOptimizeRls}
                  disabled={isOptimizingRls}
                  className="gap-2"
                >
                  {isOptimizingRls ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Optimizing Policies...
                    </>
                  ) : (
                    <>
                      <Workflow className="h-4 w-4" />
                      Optimize RLS Policies
                    </>
                  )}
                </Button>
              </div>

              {/* Multiple Permissive Policies */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Multiple Permissive Policies
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="ml-2">
                          {permissivePolicyCount} issues
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          There are {permissivePolicyCount} instances of multiple permissive policies
                          across various tables that should be consolidated for better performance.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Many tables have multiple permissive policies for the same role and operation, which affects performance.
                  These should be consolidated into single policies. Affects tables such as team_selections, fixtures, players, and more.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleConsolidatePolicies}
                    disabled={isConsolidatingPolicies}
                    className="gap-2"
                  >
                    {isConsolidatingPolicies ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Consolidating Policies...
                      </>
                    ) : (
                      <>
                        <Workflow className="h-4 w-4" />
                        Consolidate Permissive Policies
                      </>
                    )}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="text-xs">
                          This will consolidate multiple permissive policies affecting tables like:
                          team_selections, fixtures, players, coaching_comments, event_attendance,
                          and many others. The consolidation combines policies with OR conditions
                          for better performance.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Unindexed Foreign Keys */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Unindexed Foreign Keys
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="ml-2">
                          {unindexedForeignKeyCount} issues
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          There are {unindexedForeignKeyCount} foreign keys without covering indexes
                          across various tables, which can impact query performance.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Several foreign keys in the database lack indexes, which can lead to performance issues.
                  Creating indexes for these foreign keys will improve query performance, especially for join operations.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleCreateIndexes}
                    disabled={isCreatingIndexes}
                    className="gap-2"
                  >
                    {isCreatingIndexes ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Creating Indexes...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4" />
                        Create Missing Indexes
                      </>
                    )}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="text-xs">
                          This will create missing indexes for foreign key columns in tables like:
                          attendance_notification_settings, club_subscriptions, coaching_comments,
                          fixtures, player_objectives, and many others. These indexes will improve
                          query performance when joining tables.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Duplicate Indexes */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Duplicate Indexes
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="ml-2">
                          {duplicateIndexCount} issues
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          There are {duplicateIndexCount} instances of duplicate indexes that should be removed for better performance.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Some tables have duplicate indexes that serve the same purpose. This wastes disk space and slows down write operations.
                  Removing duplicate indexes will improve database performance without affecting query speed.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={handleFixDuplicateIndexes}
                    disabled={isFixingDuplicateIndexes}
                    className="gap-2"
                  >
                    {isFixingDuplicateIndexes ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Fixing Duplicate Indexes...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4" />
                        Remove Duplicate Indexes
                      </>
                    )}
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="text-xs">
                          This will identify and remove duplicate indexes, keeping only one index per unique constraint.
                          The operation is safe and won't impact query performance negatively.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Issues Requiring Manual Intervention
              </CardTitle>
              <CardDescription>
                These security issues can't be fixed automatically and require manual changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* SECURITY DEFINER Views Issues */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  SECURITY DEFINER Views
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The following views are defined with SECURITY DEFINER, which enforces the view creator's permissions
                  rather than the querying user's permissions. This may circumvent RLS policies.
                </p>
                
                <div className="bg-muted p-3 rounded-md text-sm">
                  <ul className="list-disc pl-5 space-y-1">
                    {securityDefinerViews.map((view) => (
                      <li key={view.name}>
                        <span className="font-mono text-xs">{view.name}</span> - {view.description}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Alert className="mt-3">
                  <AlertTitle>Manual Action Required</AlertTitle>
                  <AlertDescription>
                    To fix these issues, you need to modify the view definitions in your database 
                    using SQL migrations or the Supabase dashboard. Consider replacing SECURITY DEFINER 
                    with SECURITY INVOKER or implementing proper RLS policies on the underlying tables.
                  </AlertDescription>
                </Alert>
              </div>

              {/* Auth Configuration Issues */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Auth Configuration Issues
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The following auth configuration issues need to be addressed in the Supabase dashboard.
                </p>
                
                <div className="bg-muted p-3 rounded-md text-sm">
                  <ul className="list-disc pl-5 space-y-2">
                    {authConfigIssues.map((issue) => (
                      <li key={issue.name}>
                        <strong>{issue.description}</strong>
                        <p className="text-xs text-muted-foreground mt-1">
                          Remediation: {issue.remediation}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
