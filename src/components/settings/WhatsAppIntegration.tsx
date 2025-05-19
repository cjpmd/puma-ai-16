
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface WhatsAppSettings {
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
      
      // First check if the whatsapp_settings table exists
      const { data: whatsappTable, error: tableError } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error("Error checking whatsapp table:", tableError);
        // Table might not exist, let's initialize with defaults
        setSettings({
          enabled: false,
          whatsapp_business_id: '',
          whatsapp_phone_id: '',
        });
        setLoading(false);
        return;
      }
      
      // If we get here, the table exists, so fetch settings
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .single();
        
      if (error) {
        // If no records, initialize with defaults
        if (error.code === 'PGRST116') {
          setSettings({
            enabled: false,
            whatsapp_business_id: '',
            whatsapp_phone_id: '',
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load WhatsApp settings: " + error.message,
            variant: "destructive"
          });
        }
      } else {
        setSettings(data);
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
      
      const { error } = await supabase
        .from('whatsapp_settings')
        .upsert({
          id: settings?.id || 'default',
          enabled: settings?.enabled || false,
          whatsapp_business_id: settings?.whatsapp_business_id || '',
          whatsapp_phone_id: settings?.whatsapp_phone_id || ''
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
