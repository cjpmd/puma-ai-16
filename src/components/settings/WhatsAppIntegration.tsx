
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppSettings } from "@/types/whatsAppSettings";

interface WhatsAppIntegrationProps {
  teamId?: string;
}

export const WhatsAppIntegration = ({ teamId }: WhatsAppIntegrationProps) => {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [teamId]);

  const fetchSettings = async () => {
    if (!teamId) return;
    
    try {
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*")
        .eq("team_id", teamId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        setSettings({
          id: "",
          enabled: false,
          team_id: teamId,
          whatsapp_business_id: "",
          whatsapp_phone_id: "",
          business_phone_number: "",
        });
      }
    } catch (error) {
      console.error("Error fetching WhatsApp settings:", error);
      toast("Failed to load WhatsApp settings", { 
        description: "Please try refreshing the page."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings || !teamId) return;
    
    setSaving(true);
    try {
      const settingsData = {
        ...settings,
        team_id: teamId,
      };

      const { error } = settings.id
        ? await supabase
            .from("whatsapp_settings")
            .update(settingsData)
            .eq("id", settings.id)
        : await supabase
            .from("whatsapp_settings")
            .insert([settingsData]);

      if (error) throw error;

      toast("Settings saved", {
        description: "WhatsApp integration settings have been updated.",
      });

      // Refresh settings
      fetchSettings();
    } catch (error) {
      console.error("Error saving WhatsApp settings:", error);
      toast("Failed to save settings", { 
        description: "Please try again later."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading WhatsApp settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>WhatsApp Integration</span>
          <Switch
            checked={settings?.enabled || false}
            onCheckedChange={(checked) =>
              setSettings((prev) => prev ? { ...prev, enabled: checked } : null)
            }
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="business-id">WhatsApp Business Account ID</Label>
            <Input
              id="business-id"
              value={settings?.whatsapp_business_id || ""}
              onChange={(e) =>
                setSettings((prev) => 
                  prev ? { ...prev, whatsapp_business_id: e.target.value } : null
                )
              }
              placeholder="Enter your WhatsApp Business Account ID"
            />
          </div>
          <div>
            <Label htmlFor="phone-id">WhatsApp Phone Number ID</Label>
            <Input
              id="phone-id"
              value={settings?.whatsapp_phone_id || ""}
              onChange={(e) =>
                setSettings((prev) => 
                  prev ? { ...prev, whatsapp_phone_id: e.target.value } : null
                )
              }
              placeholder="Enter your WhatsApp Phone Number ID"
            />
          </div>
          <div>
            <Label htmlFor="phone-number">Business Phone Number</Label>
            <Input
              id="phone-number"
              value={settings?.business_phone_number || ""}
              onChange={(e) =>
                setSettings((prev) => 
                  prev ? { ...prev, business_phone_number: e.target.value } : null
                )
              }
              placeholder="Enter your business phone number"
            />
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
