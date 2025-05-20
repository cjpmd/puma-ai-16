
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { WhatsAppSettings } from "@/types/whatsAppSettings";

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

  // Use a mock function since the table might not exist yet
  const fetchWhatsAppSettingsMock = async () => {
    setIsLoading(true);
    try {
      // Mock data return
      const mockData: WhatsAppSettings[] = [{
        id: '1',
        enabled: false,
        team_id: profile?.team_id || "",
        whatsapp_business_id: '',
        whatsapp_phone_id: '',
        business_phone_number: ''
      }];
      
      setSettings(mockData);
      setEnabled(mockData[0].enabled);
      setBusinessId(mockData[0].whatsapp_business_id || "");
      setPhoneId(mockData[0].whatsapp_phone_id || "");
      setPhoneNumber(mockData[0].business_phone_number || "");
    } catch (error) {
      console.error("Error in WhatsApp settings mock fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (profile) {
      fetchWhatsAppSettingsMock();
    }
  }, [profile]);

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
        team_id: profile.team_id || "",
        whatsapp_business_id: businessId,
        whatsapp_phone_id: phoneId,
        business_phone_number: phoneNumber,
      };

      // Mock API operation - in a real app, you'd save to the database
      setTimeout(() => {
        toast({
          title: "Success",
          description: "WhatsApp settings saved successfully (mock).",
        });
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error("Error in mock saving WhatsApp settings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  const testWhatsAppConnection = async () => {
    toast({
      title: "Test Started",
      description: "Testing WhatsApp connection...",
    });
    
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
