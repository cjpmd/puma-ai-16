
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BarChart2, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const { data: teamSettings } = useQuery({
    queryKey: ["team-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching team settings:', error);
        throw error;
      }
      return data;
    },
  });

  const teamName = teamSettings?.team_name || "Broughty Pumas";

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center mb-12">
        <img 
          src="/lovable-uploads/47160456-08d9-4525-b5da-08312ba94630.png" 
          alt="Puma.AI Logo" 
          className="w-48 mb-8" 
        />
        <h1 className="text-4xl font-bold text-center mb-4">Welcome to {teamName}</h1>
        <p className="text-lg text-muted-foreground text-center">
          {teamName} Performance and Development. Powered by Puma.AI
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        <Link to="/squad">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center p-4">
              <div className="mx-auto mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Squad Management</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-muted-foreground text-center">
                View and Manage Squad
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center p-4">
              <div className="mx-auto mb-4">
                <BarChart2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-muted-foreground text-center">
                Track Player Performance
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/fixtures">
          <Card className="hover:shadow-lg transition-shadow h-full">
            <CardHeader className="text-center p-4">
              <div className="mx-auto mb-4">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <CardTitle>Fixtures</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-muted-foreground text-center">
                Manage Team Fixtures
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
