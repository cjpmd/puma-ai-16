
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Users, BarChart2, UserCircle, Calendar, LogOut, Cog } from "lucide-react";
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
  const { toast } = useToast();
  const { profile, isLoading, hasPermission } = useAuth();

  const menuItems: MenuItem[] = [
    { to: "/home", icon: <UserCircle className="mr-2 h-4 w-4" />, label: "Home", roles: ['admin', 'manager', 'coach', 'parent'] },
    { to: "/squad", icon: <Users className="mr-2 h-4 w-4" />, label: "Squad", roles: ['admin', 'manager'] },
    { to: "/analytics", icon: <BarChart2 className="mr-2 h-4 w-4" />, label: "Analytics", roles: ['admin', 'manager', 'coach'] },
    { to: "/calendar", icon: <Calendar className="mr-2 h-4 w-4" />, label: "Calendar", roles: ['admin', 'manager', 'coach', 'parent'] },
    { to: "/settings", icon: <Cog className="mr-2 h-4 w-4" />, label: "Settings", roles: ['admin'] },
  ];

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

  if (isLoading) {
    return (
      <div className="w-full bg-white shadow-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png" 
            alt="Broughty United Pumas Logo" 
            className="h-12 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          {profile && menuItems.map((item) => (
            hasPermission(item.roles) && (
              <Link key={item.to} to={item.to}>
                <Button variant="ghost">
                  {item.icon}
                  {item.label}
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
};
