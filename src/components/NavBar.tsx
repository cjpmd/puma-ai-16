import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Users, BarChart2, UserCircle, SoccerBall, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const NavBar = () => {
  const navigate = useNavigate();
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return profile;
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
          <Link to="/training">
            <Button variant="ghost">
              <SoccerBall className="mr-2 h-4 w-4" />
              Training
            </Button>
          </Link>
          {profile && (
            <>
              <span className="ml-4 text-sm text-muted-foreground">
                {profile.name}
              </span>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};