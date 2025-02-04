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
import { useEffect } from "react";

export const NavBar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication status on mount and setup listener
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (sessionError.message.includes("session_not_found")) {
            console.log("Session not found, signing out...");
            await supabase.auth.signOut();
          }
          console.error("Session error:", sessionError);
          navigate("/auth");
          return;
        }

        if (!session) {
          console.log("No active session found");
          navigate("/auth");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/auth");
      } else if (event === 'SIGNED_IN' && session) {
        // Verify the session is valid
        const { error: verifyError } = await supabase.auth.getUser();
        if (verifyError) {
          console.error("Session verification failed:", verifyError);
          await supabase.auth.signOut();
          navigate("/auth");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: profile, error: profileError, refetch: refetchProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User fetch error:", userError);
          if (userError.message.includes("session_not_found")) {
            await supabase.auth.signOut();
            navigate("/auth");
          }
          return null;
        }

        if (!user) {
          console.log("No user found");
          return null;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch profile",
          });
          return null;
        }

        return profile;
      } catch (error) {
        console.error("Profile query error:", error);
        return null;
      }
    },
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Error signing out",
          description: error.message,
        });
        return;
      }
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
          <Link to="/home">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/squad">
            <Button variant="ghost">
              <Users className="mr-2 h-4 w-4" />
              Squad
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="ghost">
              <BarChart2 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link to="/coaches">
            <Button variant="ghost">
              <UserCircle className="mr-2 h-4 w-4" />
              Coaches
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="ghost">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost">
              <Cog className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {profile.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile.name}</p>
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