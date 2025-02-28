
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
    fetchFAConnectionSettings();
  }, []);

  const fetchFAConnectionSettings = async () => {
    try {
      setIsLoading(true);
      
      // First, check if the table exists
      const { data: tableExists, error: tableCheckError } = await supabase.rpc(
        'execute_sql',
        {
          sql: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'fa_connection_settings'
          )
          `
        }
      );
      
      if (tableCheckError) {
        console.error('Error checking table existence:', tableCheckError);
        setIsLoading(false);
        return;
      }
      
      // If table doesn't exist, create it
      if (!tableExists) {
        const { error: createError } = await supabase.rpc(
          'execute_sql',
          {
            sql: `
            CREATE TABLE IF NOT EXISTS fa_connection_settings (
              id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
              enabled boolean DEFAULT false,
              team_id text,
              provider text
            );
            
            INSERT INTO fa_connection_settings (id, enabled, team_id, provider)
            VALUES ('00000000-0000-0000-0000-000000000002', false, '', 'comet')
            ON CONFLICT (id) DO NOTHING;
            `
          }
        );
        
        if (createError) {
          console.error('Error creating FA connection settings table:', createError);
          setIsLoading(false);
          toast({
            title: "Error",
            description: "Failed to set up FA connection settings",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Now fetch the settings
      const { data, error } = await supabase
        .from('fa_connection_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        // If no data exists, create a default entry
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('fa_connection_settings')
            .insert([
              {
                id: '00000000-0000-0000-0000-000000000002',
                enabled: false,
                team_id: '',
                provider: 'comet'
              }
            ])
            .select()
            .single();
          
          if (insertError) {
            console.error('Error creating default FA settings:', insertError);
          } else {
            setFASettings(newData);
          }
        } else {
          console.error('Error fetching FA connection settings:', error);
        }
      } else {
        setFASettings(data);
      }
    } catch (error) {
      console.error('Error in FA connection setup:', error);
    } finally {
      setIsLoading(false);
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
