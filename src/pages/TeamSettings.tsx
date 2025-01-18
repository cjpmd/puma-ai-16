import { useState, useEffect } from "react";
import { usePlayersStore } from "@/store/players";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AttributeSetting {
  id: string;
  category: string;
  name: string;
  is_enabled: boolean;
  display_name: string | null;
}

const TeamSettings = () => {
  const updateGlobalMultiplier = usePlayersStore((state) => state.updateGlobalMultiplier);
  const globalMultiplier = usePlayersStore((state) => state.globalMultiplier);
  const [parentNotifications, setParentNotifications] = useState(false);
  const [attributesEnabled, setAttributesEnabled] = useState(false);
  const [attributeSettings, setAttributeSettings] = useState<AttributeSetting[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
    fetchAttributeSettings();
  }, []);

  const fetchTeamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
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

  const fetchAttributeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('attribute_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAttributeSettings(data || []);
      // If any attributes are enabled, set the main toggle to true
      setAttributesEnabled(data?.some(attr => attr.is_enabled) ?? false);
    } catch (error) {
      console.error('Error fetching attribute settings:', error);
      toast({
        title: "Error",
        description: "Failed to load attribute settings",
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
          id: '00000000-0000-0000-0000-000000000000'
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

  const updateAttributeSetting = async (id: string, updates: Partial<AttributeSetting>) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAttributeSettings(prev => 
        prev.map(attr => 
          attr.id === id ? { ...attr, ...updates } : attr
        )
      );

      toast({
        title: "Success",
        description: "Attribute setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating attribute setting:', error);
      toast({
        title: "Error",
        description: "Failed to update attribute setting",
        variant: "destructive",
      });
    }
  };

  const toggleAllAttributes = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update({ is_enabled: enabled })
        .neq('id', 'dummy'); // Update all records

      if (error) throw error;

      setAttributesEnabled(enabled);
      setAttributeSettings(prev => 
        prev.map(attr => ({ ...attr, is_enabled: enabled }))
      );

      toast({
        title: "Success",
        description: `All attributes ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating attributes:', error);
      toast({
        title: "Error",
        description: "Failed to update attributes",
        variant: "destructive",
      });
    }
  };

  const groupedAttributes = attributeSettings.reduce((acc, attr) => {
    if (!acc[attr.category]) {
      acc[attr.category] = [];
    }
    acc[attr.category].push(attr);
    return acc;
  }, {} as Record<string, AttributeSetting[]>);

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Attribute Settings
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="enable-attributes" className="text-sm text-muted-foreground">
                {attributesEnabled ? 'Disable All' : 'Enable All'}
              </Label>
              <Switch
                id="enable-attributes"
                checked={attributesEnabled}
                onCheckedChange={toggleAllAttributes}
              />
            </div>
          </CardHeader>
          <CardContent>
            {attributesEnabled && (
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(groupedAttributes).map(([category, attributes]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-lg font-semibold">
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {attributes.map((attr) => (
                          <div key={attr.id} className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <Input
                                value={attr.display_name || attr.name}
                                onChange={(e) => updateAttributeSetting(attr.id, { display_name: e.target.value })}
                                className="w-full"
                              />
                            </div>
                            <Switch
                              checked={attr.is_enabled}
                              onCheckedChange={(checked) => updateAttributeSetting(attr.id, { is_enabled: checked })}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeamSettings;