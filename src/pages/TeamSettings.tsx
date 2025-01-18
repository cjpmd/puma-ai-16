import { useState, useEffect } from "react";
import { usePlayersStore } from "@/store/players";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const TeamSettings = () => {
  const updateGlobalMultiplier = usePlayersStore((state) => state.updateGlobalMultiplier);
  const globalMultiplier = usePlayersStore((state) => state.globalMultiplier);
  const [parentNotifications, setParentNotifications] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
  }, []);

  const fetchTeamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      // If data exists, use it; otherwise use default value (false)
      setParentNotifications(data?.parent_notification_enabled ?? false);
    } catch (error) {
      console.error('Error fetching team settings:', error);
      toast({
        title: "Error",
        description: "Failed to load team settings",
        variant: "destructive",
      });
    }
  };

  const updateParentNotifications = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('team_settings')
        .upsert({ 
          parent_notification_enabled: enabled,
          id: '00000000-0000-0000-0000-000000000000' // Using a default ID for single record
        });

      if (error) throw error;

      setParentNotifications(enabled);
      toast({
        title: "Success",
        description: `Parent notifications ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating parent notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update parent notification settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Team Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ronaldo Player Handicap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Global Multiplier:</span>
              <Input
                type="number"
                value={globalMultiplier}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value >= 1 && value <= 2) {
                    updateGlobalMultiplier(value);
                  }
                }}
                className="w-20"
                step="0.1"
                min="1"
                max="2"
              />
              <span className="text-sm text-muted-foreground">
                (Applies to all Ronaldo players)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="parent-notifications" className="text-sm text-muted-foreground">
                Enable WhatsApp notifications for parents
              </Label>
              <Switch
                id="parent-notifications"
                checked={parentNotifications}
                onCheckedChange={updateParentNotifications}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeamSettings;