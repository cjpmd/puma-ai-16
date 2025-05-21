
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { TeamInfoSettings } from '@/components/settings/TeamInfoSettings';
import { FormatsAndCategoriesSettings } from '@/components/settings/FormatsAndCategoriesSettings';
import { FAConnectionSettings } from '@/components/settings/FAConnectionSettings';
import { AttributeSettingsManager } from '@/components/settings/AttributeSettingsManager';
import { WhatsAppIntegration } from '@/components/settings/WhatsAppIntegration';
import { TeamUsersManager } from '@/components/settings/TeamUsersManager';
import { TeamSettings as TeamSettingsType } from '@/types/teamSettings';

// Define enhanced team settings that includes all expected properties
interface EnhancedTeamSettings extends TeamSettingsType {
  team_colors: string[];
}

// Add a default object with the expected properties for when data is missing
const defaultSettings: EnhancedTeamSettings = {
  id: "",
  team_id: "",
  admin_id: "",
  format: "7-a-side",
  hide_scores_from_parents: false,
  parent_notification_enabled: false,
  attendance_colors: {},
  created_at: "",
  updated_at: "",
  team_name: "Team",
  team_colors: ["#ffffff", "#000000"],
  team_logo: "",
  home_kit_icon: "",
  away_kit_icon: "",
  training_kit_icon: "",
  // Add backwards compatibility properties
  kit_home_icon: "",
  kit_away_icon: "",
};

export const TeamSettings = () => {
  const { data: settingsData, isLoading, error, refetch } = useQuery({
    queryKey: ["team-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .single();
      
      if (error) {
        console.error("Error fetching team settings:", error);
        return defaultSettings;
      }
      
      console.log("Raw team settings data:", data);
      
      // Transform the data to ensure team_colors is always an array
      return {
        ...data,
        team_colors: Array.isArray(data?.team_colors) ? data?.team_colors : 
                    (typeof data?.team_colors === 'string' ? [data?.team_colors] : ["#ffffff", "#000000"]),
        home_kit_icon: data?.home_kit_icon || "",
        away_kit_icon: data?.away_kit_icon || "",
        training_kit_icon: data?.training_kit_icon || "",
        // Map the kit icons properties to ensure compatibility
        kit_home_icon: data?.home_kit_icon || "",
        kit_away_icon: data?.away_kit_icon || ""
      } as EnhancedTeamSettings;
    },
    refetchOnMount: true
  });

  // Use the settings object with fallbacks:
  const settings = settingsData || defaultSettings;

  if (isLoading) {
    return <div className="p-4">Loading team settings...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-100 border border-red-300 rounded-md mb-4">
          <p className="text-red-700">Error loading team settings. Please try again.</p>
        </div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Team Settings</h1>
      
      {/* Team Info Settings */}
      <Card>
        <CardContent className="pt-6">
          <TeamInfoSettings />
        </CardContent>
      </Card>
      
      {/* Formats and Categories */}
      <Card>
        <CardContent className="pt-6">
          <FormatsAndCategoriesSettings />
        </CardContent>
      </Card>
      
      {/* FA Connection Settings */}
      <Card>
        <CardContent className="pt-6">
          <FAConnectionSettings />
        </CardContent>
      </Card>
      
      {/* Attribute Settings */}
      <Card>
        <CardContent className="pt-6">
          <AttributeSettingsManager />
        </CardContent>
      </Card>
      
      {/* WhatsApp Integration */}
      <Card>
        <CardContent className="pt-6">
          <WhatsAppIntegration />
        </CardContent>
      </Card>
      
      {/* Users Manager */}
      <Card>
        <CardContent className="pt-6">
          <TeamUsersManager teamId={settings.team_id} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSettings;
