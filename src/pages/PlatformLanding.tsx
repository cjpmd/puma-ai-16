
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, CalendarDays, School, Building, ShieldCheck, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { RoleManager } from "@/components/auth/RoleManager";
import { ParentChildLinkingDialog } from "@/components/parents/ParentChildLinkingDialog";
import { ParentCodeLinkingDialog } from "@/components/parents/ParentCodeLinkingDialog";

export function PlatformLanding() {
  const { profile, hasRole } = useAuth();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Platform</h1>
          <p className="text-muted-foreground">
            Manage your roles and navigate to specific dashboards
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <RoleManager />
          {hasRole('parent') && <ParentCodeLinkingDialog />}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Admin View */}
        {hasRole('admin') && (
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </CardTitle>
              <CardDescription>Manage teams and organization settings</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/create-team">Create New Team</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/club-settings">Club Settings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Coach View */}
        {hasRole('coach') && (
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                <span>Coach Dashboard</span>
              </CardTitle>
              <CardDescription>View player stats and schedule training</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/calendar">View Calendar</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/analytics">Player Analytics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Parent View */}
        {hasRole('parent') && (
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Parent Dashboard</span>
              </CardTitle>
              <CardDescription>Access your children's information and schedules</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/parent-dashboard">Parent Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/calendar">View Calendar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Club Management */}
        {hasRole('admin') && (
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                <span>Club Management</span>
              </CardTitle>
              <CardDescription>Manage your club and teams</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/club-dashboard">Club Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/club-settings">Manage Club</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
