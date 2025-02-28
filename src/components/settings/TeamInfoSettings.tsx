
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

interface TeamSettings {
  id: string;
  team_name: string | null;
  team_logo: string | null;
  team_colors: string | null;
  created_at: string;
}

export function TeamInfoSettings() {
  const [teamSettings, setTeamSettings] = useState<TeamSettings | null>(null);
  const [formData, setFormData] = useState({
    team_name: "",
    team_colors: "",
    team_logo: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
  }, []);

  const fetchTeamSettings = async () => {
    try {
      setIsLoading(true);
      
      // Ensure table exists
      await supabase.rpc('execute_sql', {
        sql: `
        CREATE TABLE IF NOT EXISTS team_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_name TEXT,
          team_logo TEXT,
          team_colors TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Insert default record if none exists
        INSERT INTO team_settings (id)
        SELECT '00000000-0000-0000-0000-000000000003'
        WHERE NOT EXISTS (SELECT 1 FROM team_settings LIMIT 1);
        `
      });
      
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching team settings:', error);
      } else {
        setTeamSettings(data);
        setFormData({
          team_name: data.team_name || "",
          team_colors: data.team_colors || "",
          team_logo: data.team_logo || "",
        });
      }
    } catch (error) {
      console.error('Error in team settings setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTeamSettings = async () => {
    if (!teamSettings) return;
    
    try {
      const { error } = await supabase
        .from('team_settings')
        .update({
          team_name: formData.team_name,
          team_colors: formData.team_colors,
          team_logo: formData.team_logo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamSettings.id);
      
      if (error) {
        console.error('Error updating team settings:', error);
        toast({
          title: "Error",
          description: "Failed to update team settings",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Team settings updated successfully",
        });
        
        // Update local state with new values
        setTeamSettings({
          ...teamSettings,
          team_name: formData.team_name,
          team_colors: formData.team_colors,
          team_logo: formData.team_logo,
        });
      }
    } catch (error) {
      console.error('Error updating team settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Team Information</CardTitle>
        <CardDescription>
          Basic information about your team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="team-name" className="text-sm font-medium">
              Team Name
            </label>
            <Input
              id="team-name"
              name="team_name"
              value={formData.team_name}
              onChange={handleInputChange}
              placeholder="Enter your team name"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="team-colors" className="text-sm font-medium">
              Team Colors
            </label>
            <Input
              id="team-colors"
              name="team_colors"
              value={formData.team_colors}
              onChange={handleInputChange}
              placeholder="e.g., Red and White"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="team-logo" className="text-sm font-medium">
              Team Logo URL
            </label>
            <Input
              id="team-logo"
              name="team_logo"
              value={formData.team_logo}
              onChange={handleInputChange}
              placeholder="https://example.com/logo.png"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter a URL to your team's logo image
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={updateTeamSettings}
          disabled={isLoading}
        >
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
