
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FAConnectionSettings {
  id: string;
  enabled: boolean;
  team_id: string;
  provider: string;
}

export function FAConnectionSettings() {
  const [faSettings, setFASettings] = useState<FAConnectionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setupAndFetchSettings();
  }, []);

  const setupAndFetchSettings = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch settings directly
      const { data: settings, error: settingsError } = await supabase
        .from('fa_connection_settings')
        .select('*')
        .limit(1);
      
      if (settingsError) {
        if (settingsError.code === '42P01') {
          // Table doesn't exist, create it
          await createSettingsTable();
          await fetchFAConnectionSettings();
        } else {
          console.error('Error fetching FA connection settings:', settingsError);
        }
      } else if (settings && settings.length > 0) {
        setFASettings(settings[0]);
      } else {
        // No settings found, create default
        await createDefaultSettings();
        await fetchFAConnectionSettings();
      }
    } catch (error) {
      console.error('Error in FA connection setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSettingsTable = async () => {
    try {
      // Try to create table using rpc
      const { error } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'fa_connection_settings',
        table_definition: `
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          enabled boolean DEFAULT false,
          team_id text,
          provider text
        `
      });
      
      if (error) {
        console.error('Error creating fa_connection_settings table:', error);
        
        // Try direct creation if RPC fails
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error creating FA settings table:', error);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { error } = await supabase
        .from('fa_connection_settings')
        .insert([
          {
            id: '00000000-0000-0000-0000-000000000002',
            enabled: false,
            team_id: '',
            provider: 'comet'
          }
        ]);
      
      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating default FA settings:', error);
      }
    } catch (error) {
      console.error('Error creating default FA settings:', error);
    }
  };

  const fetchFAConnectionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('fa_connection_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching FA connection settings:', error);
      } else {
        setFASettings(data);
      }
    } catch (error) {
      console.error('Error fetching FA connection settings:', error);
    }
  };

  const updateFAConnectionSettings = async (updates: Partial<FAConnectionSettings>) => {
    try {
      if (!faSettings) return;
      
      // Optimistically update UI state
      const updatedSettings = { ...faSettings, ...updates };
      setFASettings(updatedSettings);
      
      const { error } = await supabase
        .from('fa_connection_settings')
        .update(updates)
        .eq('id', faSettings.id);
      
      if (error) {
        console.error('Error updating FA connection settings:', error);
        // Revert UI state on error
        setFASettings(faSettings);
        toast({
          title: "Error",
          description: "Failed to update FA connection settings",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "FA connection settings updated successfully",
        });
      }
    } catch (error) {
      console.error('Error in updateFAConnectionSettings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Connect to Your Regional FA</CardTitle>
        <CardDescription>
          Connect to your regional Football Association to import player data and sync match information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium">Enable FA Connection</h3>
            <p className="text-sm text-muted-foreground">
              Turn on to enable integration with your FA system
            </p>
          </div>
          <Switch
            checked={faSettings?.enabled || false}
            onCheckedChange={(checked) => updateFAConnectionSettings({ enabled: checked })}
            disabled={isLoading}
          />
        </div>
        
        {faSettings?.enabled && (
          <div className="space-y-4 mt-4">
            <div className="grid gap-2">
              <label htmlFor="team-id" className="text-sm font-medium">
                Team ID
              </label>
              <Input
                id="team-id"
                value={faSettings.team_id || ''}
                onChange={(e) => updateFAConnectionSettings({ team_id: e.target.value })}
                placeholder="Enter your FA team ID"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                You can find your team ID in your FA account settings
              </p>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="provider" className="text-sm font-medium">
                Provider
              </label>
              <Select
                value={faSettings.provider || 'comet'}
                onValueChange={(value) => updateFAConnectionSettings({ provider: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comet">FA Comet</SelectItem>
                  <SelectItem value="matchday">MatchDay</SelectItem>
                  <SelectItem value="fulltime">Full Time</SelectItem>
                  <SelectItem value="playmetrix">Playmetrix</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
