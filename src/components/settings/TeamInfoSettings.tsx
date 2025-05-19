import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Check } from "lucide-react";
import { KitIconSelector } from "./KitIconSelector";
import { TeamSettings } from "@/types/teamSettings";

interface TeamInfoSettingsProps {
  onTeamInfoUpdated?: () => void;
}

export function TeamInfoSettings({ onTeamInfoUpdated }: TeamInfoSettingsProps) {
  const [teamSettings, setTeamSettings] = useState<TeamSettings | null>(null);
  const [formData, setFormData] = useState({
    team_name: "",
    team_colors: "", // We'll repurpose this for age group
    team_logo: "",
    home_kit_icon: "",
    away_kit_icon: "",
    training_kit_icon: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
  }, []);

  // Reset the success indicator after a delay
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000); // Reset after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  const fetchTeamSettings = async () => {
    try {
      setIsLoading(true);
      
      // Ensure table exists with kit icon fields
      await supabase.rpc('execute_sql', {
        sql_string: `
        CREATE TABLE IF NOT EXISTS team_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          team_name TEXT,
          team_logo TEXT,
          team_colors TEXT,
          home_kit_icon TEXT,
          away_kit_icon TEXT,
          training_kit_icon TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Insert default record if none exists
        INSERT INTO team_settings (id)
        SELECT '00000000-0000-0000-0000-000000000003'
        WHERE NOT EXISTS (SELECT 1 FROM team_settings LIMIT 1);

        -- Add kit icon columns if they don't exist
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'team_settings' AND column_name = 'home_kit_icon') THEN
            ALTER TABLE team_settings ADD COLUMN home_kit_icon TEXT;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'team_settings' AND column_name = 'away_kit_icon') THEN
            ALTER TABLE team_settings ADD COLUMN away_kit_icon TEXT;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'team_settings' AND column_name = 'training_kit_icon') THEN
            ALTER TABLE team_settings ADD COLUMN training_kit_icon TEXT;
          END IF;
        END $$;
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
        // Create a full team settings object with all expected fields
        const fullTeamSettings: TeamSettings = {
          id: data.id || "",
          team_name: data.team_name || "",
          team_colors: data.team_colors ? [data.team_colors] : [], // Convert to array for type compatibility
          team_logo: data.team_logo || "",
          home_kit_icon: ensurePatternFormat(data.home_kit_icon || ""),
          away_kit_icon: ensurePatternFormat(data.away_kit_icon || ""),
          training_kit_icon: ensurePatternFormat(data.training_kit_icon || ""),
          created_at: data.created_at || "",
          parent_notification_enabled: data.parent_notification_enabled || false,
          hide_scores_from_parents: data.hide_scores_from_parents || false,
          attendance_colors: data.attendance_colors || null,
          team_id: data.team_id || "",
          admin_id: data.admin_id || "",
          format: data.format || "",
          updated_at: data.updated_at || ""
        };
        
        setTeamSettings(fullTeamSettings);
        
        // For each kit icon, ensure it has the pattern (backward compatibility)
        setFormData({
          team_name: data.team_name || "",
          team_colors: data.team_colors || "",
          team_logo: data.team_logo || "",
          home_kit_icon: ensurePatternFormat(data.home_kit_icon || ""),
          away_kit_icon: ensurePatternFormat(data.away_kit_icon || ""),
          training_kit_icon: ensurePatternFormat(data.training_kit_icon || ""),
        });
      }
    } catch (error) {
      console.error('Error in team settings setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure the color values include the pattern information (for backward compatibility)
  const ensurePatternFormat = (value: string | null): string => {
    if (!value) return "";
    
    const parts = value.split("|");
    // If only has primary and secondary colors, add the default "solid" pattern
    if (parts.length === 2) {
      return `${parts[0]}|${parts[1]}|solid`;
    }
    return value;
  };

  const updateTeamSettings = async () => {
    if (!teamSettings) return;
    
    try {
      setIsSaving(true);
      
      console.log("Updating team settings with age group:", formData.team_colors);
      
      // Update both team_settings and teams tables
      const { error: settingsError } = await supabase
        .from('team_settings')
        .update({
          team_name: formData.team_name,
          team_colors: formData.team_colors, // Age group data
          team_logo: formData.team_logo,
          home_kit_icon: formData.home_kit_icon,
          away_kit_icon: formData.away_kit_icon,
          training_kit_icon: formData.training_kit_icon,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamSettings.id);
      
      if (settingsError) {
        console.error('Error updating team settings:', settingsError);
        toast({
          title: "Error",
          description: "Failed to update team settings",
          variant: "destructive",
        });
        return;
      }
      
      // Also update the teams table with the new team name and age group
      try {
        const { data: teamData } = await supabase
          .from('teams')
          .select('id')
          .eq('admin_id', (await supabase.auth.getUser()).data.user?.id)
          .limit(1)
          .single();
          
        if (teamData) {
          console.log("Updating team in teams table with age group:", formData.team_colors);
          await supabase
            .from('teams')
            .update({ 
              team_name: formData.team_name,
              age_group: formData.team_colors // Explicitly update age_group with team_colors value
            })
            .eq('id', teamData.id);
        }
      } catch (teamUpdateError) {
        console.error('Error updating team data in teams table:', teamUpdateError);
      }
      
      // Visual feedback - set success state
      setSaveSuccess(true);
      
      toast({
        title: "Success",
        description: "Team settings updated successfully",
      });
      
      // Update local state with new values
      if (teamSettings) {
        const updatedSettings: TeamSettings = {
          ...teamSettings,
          team_name: formData.team_name,
          team_colors: [formData.team_colors], // Convert to array for type compatibility
          team_logo: formData.team_logo,
          home_kit_icon: formData.home_kit_icon,
          away_kit_icon: formData.away_kit_icon,
          training_kit_icon: formData.training_kit_icon,
        };
        setTeamSettings(updatedSettings);
      }
      
      // Notify parent that team info was updated
      if (onTeamInfoUpdated) {
        onTeamInfoUpdated();
      }
      
    } catch (error) {
      console.error('Error updating team settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleKitIconChange = (type: 'home_kit_icon' | 'away_kit_icon' | 'training_kit_icon', value: string) => {
    setFormData(prev => ({ ...prev, [type]: value }));
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
              Age Group (e.g., Year Born or u18s)
            </label>
            <Input
              id="team-colors"
              name="team_colors"
              value={formData.team_colors}
              onChange={handleInputChange}
              placeholder="e.g., 2010 or u14s"
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

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Kit Icons</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create visual indicators for different kits that will be shown in fixture details.
              Choose colors and patterns for each kit type.
            </p>
            
            <div className="grid gap-6 md:grid-cols-3">
              <KitIconSelector
                type="home_kit_icon"
                label="Home Kit"
                value={formData.home_kit_icon}
                onChange={handleKitIconChange}
                disabled={isLoading}
              />
              
              <KitIconSelector
                type="away_kit_icon"
                label="Away Kit"
                value={formData.away_kit_icon}
                onChange={handleKitIconChange}
                disabled={isLoading}
              />
              
              <KitIconSelector
                type="training_kit_icon"
                label="Training Kit"
                value={formData.training_kit_icon}
                onChange={handleKitIconChange}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={updateTeamSettings}
          disabled={isLoading || isSaving}
          className="relative"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : saveSuccess ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
