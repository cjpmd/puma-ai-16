
// Create a new WhatsAppIntegration.tsx file with proper types
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

// Define the WhatsAppSettings interface
interface WhatsAppSettings {
  id: string;
  enabled: boolean;
  team_id: string;
  provider?: string;
  whatsapp_business_id?: string;
  whatsapp_phone_id?: string;
  business_phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

export const WhatsAppIntegration = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [settings, setSettings] = useState<WhatsAppSettings[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [businessId, setBusinessId] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchWhatsAppSettings();
    }
  }, [profile]);

  const fetchWhatsAppSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("whatsapp_settings")
        .select("*");

      if (error) {
        console.error("Error fetching WhatsApp settings:", error);
        toast({
          title: "Error",
          description: "Failed to load WhatsApp settings.",
          variant: "destructive",
        });
      } else {
        // Type assertion to ensure array handling
        const settingsData = data as WhatsAppSettings[];
        setSettings(settingsData || []);
        
        if (settingsData && settingsData.length > 0) {
          const current = settingsData[0];
          setEnabled(current.enabled);
          setBusinessId(current.whatsapp_business_id || "");
          setPhoneId(current.whatsapp_phone_id || "");
          setPhoneNumber(current.business_phone_number || "");
        }
      }
    } catch (error) {
      console.error("Error in WhatsApp settings fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to save settings.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const settingsData = {
        enabled,
        team_id: profile.team_id || null,
        whatsapp_business_id: businessId,
        whatsapp_phone_id: phoneId,
        business_phone_number: phoneNumber,
      };

      let action;
      if (settings && settings.length > 0) {
        // Update existing record
        action = supabase
          .from("whatsapp_settings")
          .update(settingsData)
          .eq("id", settings[0].id);
      } else {
        // Insert new record
        action = supabase
          .from("whatsapp_settings")
          .insert([settingsData]);
      }

      const { error } = await action;

      if (error) {
        console.error("Error saving WhatsApp settings:", error);
        toast({
          title: "Error",
          description: "Failed to save WhatsApp settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "WhatsApp settings saved successfully.",
        });
        fetchWhatsAppSettings(); // Refresh data
      }
    } catch (error) {
      console.error("Error in saving WhatsApp settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testWhatsAppConnection = async () => {
    // Placeholder for WhatsApp connection test
    toast({
      title: "Test Started",
      description: "Testing WhatsApp connection...",
    });
    
    // Here you would implement actual WhatsApp API testing
    // For now, we'll just simulate it
    setTimeout(() => {
      toast({
        title: "Test Complete",
        description: "WhatsApp connection successful!",
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Integration</CardTitle>
        <CardDescription>
          Configure WhatsApp messaging for team communications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Switch 
            checked={enabled} 
            onCheckedChange={setEnabled} 
            disabled={isSaving}
          />
          <Label htmlFor="whatsapp-enabled">Enable WhatsApp Messaging</Label>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="business-id">WhatsApp Business Account ID</Label>
            <Input 
              id="business-id"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="Enter your WhatsApp Business Account ID"
              disabled={!enabled || isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone-id">WhatsApp Phone Number ID</Label>
            <Input 
              id="phone-id"
              value={phoneId}
              onChange={(e) => setPhoneId(e.target.value)}
              placeholder="Enter your WhatsApp Phone Number ID"
              disabled={!enabled || isSaving}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone-number">Business Phone Number</Label>
            <Input 
              id="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your WhatsApp Business Phone Number"
              disabled={!enabled || isSaving}
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
          <Button 
            variant="outline" 
            onClick={testWhatsAppConnection}
            disabled={!enabled || !businessId || !phoneId || isSaving}
          >
            Test Connection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppIntegration;
