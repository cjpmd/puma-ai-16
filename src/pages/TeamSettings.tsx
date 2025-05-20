
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
  home_kit_icon: "",
  away_kit_icon: "",
  training_kit_icon: "",
  kit_home_icon: "",
  kit_away_icon: ""
};

export const TeamSettings = () => {
  const { data: settingsData, isLoading, error } = useQuery({
    queryKey: ["team-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .single();
      
      if (error) return defaultSettings;
      
      // Transform the data to ensure team_colors is always an array
      return {
        ...data,
        team_colors: Array.isArray(data?.team_colors) ? data?.team_colors : 
                    (typeof data?.team_colors === 'string' ? [data?.team_colors] : ["#ffffff", "#000000"])
      } as EnhancedTeamSettings;
    }
  });

  // Use the settings object with fallbacks:
  const settings = settingsData || defaultSettings;

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
          <TeamUsersManager teamId="your-team-id" />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSettings;
