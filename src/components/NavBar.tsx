import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Users, BarChart2, UserCircle, Calendar, LogOut, Cog, Home, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useAuth, UserRole } from "@/hooks/useAuth";

interface MenuItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[];
}

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { profile, isLoading, hasPermission } = useAuth();
  const [userTeam, setUserTeam] = useState<any>(null);
  const [userClub, setUserClub] = useState<any>(null);
  
  useEffect(() => {
    if (!profile) return;
    
    const fetchUserEntities = async () => {
      try {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();
          
        if (teamError) throw teamError;
        
        if (teamData) {
          setUserTeam(teamData);
        }
        
        const { data: clubData, error: clubError } = await supabase
          .from('clubs')
          .select('*')
          .eq('admin_id', profile.id)
          .maybeSingle();
          
        if (clubError) throw clubError;
        
        if (clubData) {
          setUserClub(clubData);
        }
      } catch (error) {
        console.error("Error fetching user entities:", error);
      }
    };
    
    fetchUserEntities();
  }, [profile]);

  const menuItems: MenuItem[] = [
    { to: "/platform", icon: <Home className="mr-2 h-4 w-4" />, label: "Platform", roles: ['admin', 'manager', 'coach', 'parent'] },
    { to: "/home", icon: <UserCircle className="mr-2 h-4 w-4" />, label: "Team Dashboard", roles: ['admin', 'manager', 'coach', 'parent'] },
    { to: "/squad", icon: <Users className="mr-2 h-4 w-4" />, label: "Squad", roles: ['admin', 'manager'] },
    { to: "/analytics", icon: <BarChart2 className="mr-2 h-4 w-4" />, label: "Analytics", roles: ['admin', 'manager', 'coach'] },
    { to: "/calendar", icon: <Calendar className="mr-2 h-4 w-4" />, label: "Calendar", roles: ['admin', 'manager', 'coach', 'parent'] },
    { to: "/settings", icon: <Cog className="mr-2 h-4 w-4" />, label: "Team Settings", roles: ['admin'] },
  ];
  
  if (userClub) {
    menuItems.push({ 
      to: `/club/${userClub.id}`, 
      icon: <Building className="mr-2 h-4 w-4" />, 
      label: "Club Dashboard", 
      roles: ['admin']
    });
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };
  
  const isTeamRoute = location.pathname.includes('/home') || 
                      location.pathname.includes('/squad') || 
                      location.pathname.includes('/analytics') || 
                      location.pathname.includes('/calendar') || 
                      location.pathname.includes('/settings') ||
                      location.pathname.includes('/fixtures') ||
                      location.pathname.includes('/player') ||
                      location.pathname.includes('/formation') ||
                      location.pathname.includes('/top-rated');
                      
  const isPlatformRoute = location.pathname.includes('/platform') || 
                          location.pathname.includes('/create-team') || 
                          location.pathname.includes('/club-settings') ||
                          location.pathname.includes('/club/');

  if (isLoading) {
    return (
      <div className="w-full bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <div>Loading...</div>
        </div>
      </div>
    );
  }
  
  if (location.pathname === '/auth') {
    return null;
  }

  return (
    <div className="w-full bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/47160456-08d9-4525-b5da-08312ba94630.png" 
            alt="Puma.AI Logo" 
            className="h-12 w-auto"
          />
          {isTeamRoute && userTeam && (
            <div className="ml-4 hidden sm:block">
              <div className="text-xl font-bold">{userTeam.team_name}</div>
              <div className="text-sm text-muted-foreground">{userTeam.age_group}</div>
            </div>
          )}
          {isPlatformRoute && (
            <div className="ml-4 hidden sm:block">
              <div className="text-xl font-bold">Team Platform</div>
              <div className="text-sm text-muted-foreground">Multi-team management</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {profile && menuItems.map((item) => (
            hasPermission(item.roles) && (
              <Link key={item.to} to={item.to}>
                <Button 
                  variant={location.pathname === item.to ? "default" : "ghost"}
                  className={location.pathname === item.to ? "bg-primary" : ""}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              </Link>
            )
          ))}
          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {profile.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/platform")}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Platform Dashboard</span>
                </DropdownMenuItem>
                {hasPermission(['admin']) && (
                  <DropdownMenuItem onClick={() => navigate("/club-settings")}>
                    <Building className="mr-2 h-4 w-4" />
                    <span>Club Management</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
