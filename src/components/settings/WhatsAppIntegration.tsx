
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { WhatsAppSettings } from "@/types/whatsAppSettings";
import { ensureColumnExists, tableExists } from "@/utils/database/columnUtils";

export function WhatsAppIntegration() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    enabled: false,
    whatsapp_business_id: "",
    whatsapp_phone_id: ""
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setupWhatsappTable();
    fetchSettings();
  }, []);

  const setupWhatsappTable = async () => {
    try {
      // Check if the table exists
      const exists = await tableExists("whatsapp_settings");
      
      if (!exists) {
        // Create the table if it doesn't exist
        await supabase.rpc('execute_sql', {
          sql_string: `
          CREATE TABLE IF NOT EXISTS whatsapp_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            enabled BOOLEAN DEFAULT false,
            whatsapp_business_id TEXT,
            whatsapp_phone_id TEXT,
            team_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          `
        });
        
        // Insert a default record
        await supabase.rpc('execute_sql', {
          sql_string: `
          INSERT INTO whatsapp_settings (enabled)
          SELECT false
          WHERE NOT EXISTS (SELECT 1 FROM whatsapp_settings LIMIT 1);
          `
        });
      }
    } catch (error) {
      console.error("Error setting up WhatsApp settings table:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_string: `SELECT * FROM whatsapp_settings LIMIT 1;`
      });
      
      if (error) {
        console.error("Error fetching WhatsApp settings:", error);
        return;
      }
      
      if (data && data.length > 0) {
        // Extract the actual settings from the response
        const settingsData = data[0]?.rows?.[0] || {
          enabled: false,
          whatsapp_business_id: "",
          whatsapp_phone_id: ""
        };
        
        setSettings({
          id: settingsData.id || undefined,
          enabled: settingsData.enabled || false,
          whatsapp_business_id: settingsData.whatsapp_business_id || "",
          whatsapp_phone_id: settingsData.whatsapp_phone_id || "",
          team_id: settingsData.team_id || undefined
        });
      }
    } catch (error) {
      console.error("Error processing WhatsApp settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase.rpc('execute_sql', {
        sql_string: `
        INSERT INTO whatsapp_settings (enabled, whatsapp_business_id, whatsapp_phone_id)
        VALUES (${settings.enabled}, '${settings.whatsapp_business_id || ""}', '${settings.whatsapp_phone_id || ""}')
        ON CONFLICT (id)
        DO UPDATE SET 
          enabled = ${settings.enabled},
          whatsapp_business_id = '${settings.whatsapp_business_id || ""}',
          whatsapp_phone_id = '${settings.whatsapp_phone_id || ""}',
          updated_at = now();
        `
      });
      
      if (error) {
        console.error("Error saving WhatsApp settings:", error);
        toast("Failed to save WhatsApp integration settings");
        return;
      }
      
      toast("WhatsApp integration settings saved successfully");
    } catch (error) {
      console.error("Error saving WhatsApp settings:", error);
      toast("An error occurred while saving WhatsApp settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Integration</CardTitle>
        <CardDescription>
          Connect your WhatsApp Business account to send notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="whatsapp-enabled" 
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings({...settings, enabled: checked})}
            disabled={isLoading || isSaving}
          />
          <Label htmlFor="whatsapp-enabled">Enable WhatsApp Integration</Label>
        </div>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="whatsapp-business-id">WhatsApp Business Account ID</Label>
            <Input
              id="whatsapp-business-id"
              value={settings.whatsapp_business_id || ""}
              onChange={(e) => setSettings({...settings, whatsapp_business_id: e.target.value})}
              placeholder="Enter your WhatsApp Business Account ID"
              disabled={isLoading || isSaving || !settings.enabled}
            />
          </div>
          <div>
            <Label htmlFor="whatsapp-phone-id">WhatsApp Phone Number ID</Label>
            <Input
              id="whatsapp-phone-id"
              value={settings.whatsapp_phone_id || ""}
              onChange={(e) => setSettings({...settings, whatsapp_phone_id: e.target.value})}
              placeholder="Enter your WhatsApp Phone Number ID"
              disabled={isLoading || isSaving || !settings.enabled}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={isLoading || isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
