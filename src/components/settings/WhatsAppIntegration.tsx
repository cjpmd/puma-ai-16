
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ensureColumnExists } from "@/utils/database/columnUtils";

// Define the WhatsAppSettings interface
interface WhatsAppSettings {
  id?: string;
  enabled: boolean;
  whatsapp_business_id?: string;
  whatsapp_phone_id?: string;
}

export const WhatsAppIntegration = () => {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // First ensure the whatsapp_settings table exists
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS whatsapp_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            enabled BOOLEAN DEFAULT false,
            whatsapp_business_id TEXT,
            whatsapp_phone_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Insert default record if none exists
          INSERT INTO whatsapp_settings (id, enabled)
          SELECT '00000000-0000-0000-0000-000000000001', false
          WHERE NOT EXISTS (SELECT 1 FROM whatsapp_settings LIMIT 1);
        `
      });
      
      // Now fetch the settings
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_string: 'SELECT * FROM whatsapp_settings LIMIT 1'
      });
      
      if (error) {
        console.error("Error fetching WhatsApp settings:", error);
        toast({
          title: "Error",
          description: "Failed to load WhatsApp settings",
          variant: "destructive"
        });
      } else if (data && data.length > 0) {
        const settingsData = data[0];
        setSettings({
          id: settingsData.id,
          enabled: settingsData.enabled || false,
          whatsapp_business_id: settingsData.whatsapp_business_id || '',
          whatsapp_phone_id: settingsData.whatsapp_phone_id || '',
        });
      } else {
        // Initialize with default settings
        setSettings({
          enabled: false,
          whatsapp_business_id: '',
          whatsapp_phone_id: '',
        });
      }
    } catch (error) {
      console.error("Error loading WhatsApp settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase.rpc('execute_sql', {
        sql_string: `
          UPDATE whatsapp_settings
          SET enabled = ${settings.enabled},
              whatsapp_business_id = '${settings.whatsapp_business_id || ''}',
              whatsapp_phone_id = '${settings.whatsapp_phone_id || ''}',
              updated_at = now()
          WHERE id = '${settings.id || '00000000-0000-0000-0000-000000000001'}';
        `
      });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "WhatsApp settings updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save settings: " + error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestWhatsApp = async () => {
    if (!testNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number to test",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setTestingWhatsApp(true);
      
      // Call an edge function or API to send test message
      const { data, error } = await supabase.functions.invoke('test-whatsapp-message', {
        body: { 
          phoneNumber: testNumber.replace(/\D/g, ''), // Strip non-digits
        }
      });
      
      if (error) throw error;
      
      if (data && data.success) {
        toast({
          title: "Success",
          description: "WhatsApp test message sent successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data?.error || "Failed to send test message",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to test WhatsApp integration: " + error.message,
        variant: "destructive"
      });
    } finally {
      setTestingWhatsApp(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Integration</CardTitle>
          <CardDescription>
            Configure WhatsApp Business API integration for notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Integration</CardTitle>
        <CardDescription>
          Configure WhatsApp Business API integration for player and parent notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="whatsapp-enabled">Enable WhatsApp Notifications</Label>
          <Switch 
            id="whatsapp-enabled" 
            checked={settings?.enabled || false}
            onCheckedChange={(checked) => setSettings(prev => prev ? {...prev, enabled: checked} : {enabled: checked})}
          />
        </div>
        
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="business-id">WhatsApp Business Account ID</Label>
            <Input 
              id="business-id" 
              value={settings?.whatsapp_business_id || ''} 
              onChange={(e) => setSettings(prev => prev ? {...prev, whatsapp_business_id: e.target.value} : {enabled: false, whatsapp_business_id: e.target.value})}
              placeholder="Enter your WhatsApp Business Account ID"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone-id">WhatsApp Phone Number ID</Label>
            <Input 
              id="phone-id" 
              value={settings?.whatsapp_phone_id || ''} 
              onChange={(e) => setSettings(prev => prev ? {...prev, whatsapp_phone_id: e.target.value} : {enabled: false, whatsapp_phone_id: e.target.value})}
              placeholder="Enter your WhatsApp Phone Number ID"
            />
          </div>
        </div>
        
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Settings"}
        </Button>
        
        <div className="pt-4 border-t mt-6">
          <CardTitle className="text-lg mb-4">Test WhatsApp Integration</CardTitle>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="test-number">Test Phone Number</Label>
              <Input 
                id="test-number" 
                value={testNumber} 
                onChange={(e) => setTestNumber(e.target.value)}
                placeholder="Enter a phone number with country code (e.g., +447123456789)"
              />
            </div>
            
            <Button 
              onClick={handleTestWhatsApp} 
              disabled={testingWhatsApp || !settings?.enabled}
              variant={settings?.enabled ? "default" : "secondary"}
            >
              {testingWhatsApp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : "Send Test Message"}
            </Button>
            
            {!settings?.enabled && (
              <p className="text-sm text-muted-foreground">
                Enable WhatsApp notifications to send test messages
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppIntegration;
