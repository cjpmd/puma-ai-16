
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

// Add a default object with the expected properties for when data is missing
const defaultSettings = {
  team_name: "",
  team_colors: ["#ffffff", "#000000"],
  // Add other default properties as needed
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
      return data || defaultSettings;
    }
  });

  // Use the settings object with fallbacks:
  const settings = settingsData || defaultSettings;
  const teamName = settings.team_name || "Team";
  const teamColors = settings.team_colors || ["#ffffff", "#000000"];

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Team Settings</h1>
      
      {/* Team Info Settings */}
      <Card>
        <CardContent className="pt-6">
          <TeamInfoSettings 
            settings={settings} 
            onSettingsUpdated={() => {}} 
          />
        </CardContent>
      </Card>
      
      {/* Formats and Categories */}
      <Card>
        <CardContent className="pt-6">
          <FormatsAndCategoriesSettings 
            settings={settings} 
            onSettingsUpdated={() => {}} 
          />
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
