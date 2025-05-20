import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Users, BarChart2, UserCircle, Calendar, LogOut, Cog, Home, Building, LogIn, Plus, SwitchCamera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth.tsx"; 
import { UserRole } from "@/types/auth"; // Import UserRole from the correct location

interface MenuItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: UserRole[];
  public?: boolean;
}

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const [userTeam, setUserTeam] = useState<any>(null);
  const [userClub, setUserClub] = useState<any>(null);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuth();
  const { activeRole, switchRole, hasRole } = auth;
  
  useEffect(() => {
    // Try to get team logo from localStorage first for faster initial render
    const storedLogo = localStorage.getItem('team_logo');
    const storedName = localStorage.getItem('team_name');
    
    if (storedLogo) {
      setTeamLogo(storedLogo);
    }
    
    if (storedName && !userTeam) {
      setUserTeam({ team_name: storedName });
    }
    
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          fetchUserEntities(data.session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        setLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserEntities(session.user.id);
        } else {
          setUserTeam(null);
          setUserClub(null);
          setTeamLogo(null);
          setLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserEntities = async (userId: string) => {
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*, team_logo')
        .eq('admin_id', userId)
        .maybeSingle();
        
      if (teamError) throw teamError;
      
      if (teamData) {
        console.log("Team data fetched:", teamData);
        setUserTeam(teamData);
        
        // Update team logo if available
        if (teamData.team_logo) {
          setTeamLogo(teamData.team_logo);
          localStorage.setItem('team_logo', teamData.team_logo);
        }
        
        // Store team name
        localStorage.setItem('team_name', teamData.team_name || 'My Team');
      }
      
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('admin_id', userId)
        .maybeSingle();
        
      if (clubError) throw clubError;
      
      if (clubData) {
        setUserClub(clubData);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user entities:", error);
      setLoading(false);
    }
  };

  const menuItems: MenuItem[] = [
    { to: "/", icon: <Home className="mr-2 h-4 w-4" />, label: "Home", roles: [], public: true },
  ];
  
  // Add authenticated-only menu items if user is logged in
  if (session) {
    menuItems.push(
      { to: "/home", icon: <UserCircle className="mr-2 h-4 w-4" />, label: "Team Dashboard", roles: ['admin', 'manager', 'coach', 'parent'] },
      { to: "/squad-management", icon: <Users className="mr-2 h-4 w-4" />, label: "Squad", roles: ['admin', 'manager'] },
      { to: "/analytics", icon: <BarChart2 className="mr-2 h-4 w-4" />, label: "Analytics", roles: ['admin', 'manager', 'coach'] },
      { to: "/calendar", icon: <Calendar className="mr-2 h-4 w-4" />, label: "Calendar", roles: ['admin', 'manager', 'coach', 'parent'] },
      { to: "/settings", icon: <Cog className="mr-2 h-4 w-4" />, label: "Team Settings", roles: ['admin'] }
    );
  }
  
  // Add club dashboard if user has a club
  if (session && userClub) {
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
      
      // Clear local storage on logout
      localStorage.removeItem('team_logo');
      localStorage.removeItem('team_name');
      
      setUserTeam(null);
      setUserClub(null);
      setTeamLogo(null);
      
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out",
      });
    }
  };
  
  const hasPermission = (requiredRoles: UserRole[], isPublic?: boolean): boolean => {
    if (isPublic) return true;
    if (!session) return false;
    
    // For now, all authenticated users have admin role for simplicity
    return true;
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
                          
  const isParentRoute = location.pathname.includes('/parent-dashboard');

  // Hide navbar on auth page
  if (location.pathname === '/auth' || location.pathname === '/login') {
    return null;
  }

  // Function to handle role switching
  const handleRoleSwitch = (role: UserRole) => {
    if (switchRole) {
      switchRole(role);
      
      // Show toast notification about role switch
      toast({
        title: "Role Switched",
        description: `You are now viewing as a ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      });
    }
  };

  return (
    <div className="w-full bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isTeamRoute && teamLogo ? (
            <img 
              src={teamLogo} 
              alt="Team Logo" 
              className="h-12 w-auto"
              onError={() => {
                // Fallback to platform logo if team logo fails to load
                setTeamLogo("/lovable-uploads/47160456-08d9-4525-b5da-08312ba94630.png");
              }}
            />
          ) : (
            <Link to="/">
              <img 
                src="/lovable-uploads/47160456-08d9-4525-b5da-08312ba94630.png" 
                alt="Puma.AI Logo" 
                className="h-12 w-auto"
              />
            </Link>
          )}
          {isTeamRoute && userTeam && (
            <div className="ml-4 hidden sm:block">
              <div className="text-xl font-bold">{userTeam.team_name || "My Team"}</div>
              <div className="text-sm text-muted-foreground">{userTeam.age_group || ""}</div>
            </div>
          )}
          {isPlatformRoute && (
            <div className="ml-4 hidden sm:block">
              <div className="text-xl font-bold">Team Platform</div>
              <div className="text-sm text-muted-foreground">Multi-team management</div>
            </div>
          )}
          {isParentRoute && (
            <div className="ml-4 hidden sm:block">
              <div className="text-xl font-bold">Parent Dashboard</div>
              <div className="text-sm text-muted-foreground">Player management</div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {menuItems.map((item) => (
            (hasPermission(item.roles, item.public)) && (
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
          
          {/* Always visible buttons for creating teams and clubs */}
          {!loading && session && (
            <>
              <Button 
                variant="outline"
                onClick={() => navigate("/create-team")}
                className="hidden md:flex"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate("/club-settings")}
                className="hidden md:flex"
              >
                <Building className="mr-2 h-4 w-4" />
                Club Settings
              </Button>
            </>
          )}
          
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {session.user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user?.email || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {activeRole ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1) : "Admin"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Role Switcher */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <SwitchCamera className="mr-2 h-4 w-4" />
                    <span>Switch View</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={activeRole || undefined} onValueChange={(value) => handleRoleSwitch(value as UserRole)}>
                      <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                      {hasRole && hasRole('parent') && (
                        <DropdownMenuRadioItem value="parent">Parent</DropdownMenuRadioItem>
                      )}
                      {hasRole && hasRole('coach') && (
                        <DropdownMenuRadioItem value="coach">Coach</DropdownMenuRadioItem>
                      )}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuItem onClick={() => navigate("/platform")}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Platform Dashboard</span>
                </DropdownMenuItem>
                
                {hasRole && hasRole('parent') && (
                  <DropdownMenuItem onClick={() => navigate("/parent-dashboard")}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Parent Dashboard</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem onClick={() => navigate("/create-team")}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create Team</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/club-settings")}>
                  <Building className="mr-2 h-4 w-4" />
                  <span>Club Management</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
