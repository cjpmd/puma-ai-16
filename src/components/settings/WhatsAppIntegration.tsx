
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define interfaces for types that don't exist in the schema
interface WhatsAppSettings {
  enabled: boolean;
  business_phone_number: string;
  id?: number;
  updated_at?: string;
}

interface WhatsAppContact {
  id: string;
  name?: string;
  phone_number: string;
  last_interaction: string;
  created_at?: string;
}

export const WhatsAppIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [whatsappContacts, setWhatsAppContacts] = useState<WhatsAppContact[]>([]);
  const [showAllContacts, setShowAllContacts] = useState(false);

  useEffect(() => {
    loadSettings();
    fetchContacts();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Use RPC function to ensure the table exists
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS whatsapp_settings (
            id integer PRIMARY KEY,
            enabled boolean DEFAULT false,
            business_phone_number text,
            updated_at timestamp with time zone DEFAULT now()
          );
          
          -- Ensure at least one record exists
          INSERT INTO whatsapp_settings (id, enabled, business_phone_number)
          SELECT 1, false, ''
          WHERE NOT EXISTS (SELECT 1 FROM whatsapp_settings WHERE id = 1);
        `
      });
      
      // Now query the settings
      const { data: settings, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && settings) {
        setIsEnabled(settings.enabled || false);
        setPhoneNumber(settings.business_phone_number || "");
      }
    } catch (error) {
      console.error("Error loading WhatsApp settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      // Use RPC function to ensure the table exists
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS whatsapp_contacts (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text,
            phone_number text NOT NULL,
            last_interaction timestamp with time zone DEFAULT now(),
            created_at timestamp with time zone DEFAULT now()
          );
        `
      });
      
      // Now query the contacts
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setWhatsAppContacts(data || []);
    } catch (error) {
      console.error("Error fetching WhatsApp contacts:", error);
      setWhatsAppContacts([]);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("whatsapp_settings")
        .upsert({
          id: 1, // Using a singleton pattern with id=1
          enabled: isEnabled,
          business_phone_number: phoneNumber,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving WhatsApp settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestMessage = async () => {
    setIsTesting(true);
    setTestSuccess(false);
    try {
      if (!testPhoneNumber) {
        toast.error("Please enter a test phone number");
        return;
      }

      // Call the function to send a test message
      const { data, error } = await supabase.functions.invoke(
        "send-whatsapp-test",
        {
          body: {
            phoneNumber: testPhoneNumber,
          },
        }
      );

      if (error) throw error;

      toast.success("Test message sent successfully");
      setTestSuccess(true);
    } catch (error) {
      console.error("Error sending test message:", error);
      toast.error("Failed to send test message");
    } finally {
      setIsTesting(false);
    }
  };

  // Display a limited set of contacts based on showAllContacts state
  const displayedContacts = showAllContacts
    ? whatsappContacts
    : whatsappContacts.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            WhatsApp Integration
          </CardTitle>
          <CardDescription>
            Connect your WhatsApp Business account to send notifications to
            parents and players.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              id="whatsapp-enabled"
            />
            <Label htmlFor="whatsapp-enabled">Enable WhatsApp Notifications</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Business Phone Number</Label>
            <Input
              id="phone-number"
              placeholder="+44712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Enter your WhatsApp Business phone number with country code
            </p>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium mb-2">Test Connection</h4>
            <div className="flex space-x-2">
              <Input
                placeholder="Test phone number"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
              />
              <Button
                onClick={sendTestMessage}
                disabled={isTesting}
                className="flex items-center"
              >
                {isTesting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : testSuccess ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : null}
                Send Test
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>

      {/* Recent WhatsApp Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent WhatsApp Contacts</CardTitle>
          <CardDescription>
            Contacts that have interacted with your WhatsApp Business account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {whatsappContacts && whatsappContacts.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 font-medium text-sm">
                <div>Name</div>
                <div>Phone</div>
                <div>Last Interaction</div>
              </div>
              {displayedContacts.map((contact) => (
                <div key={contact.id} className="grid grid-cols-3 text-sm">
                  <div>{contact.name || "Unknown"}</div>
                  <div>{contact.phone_number}</div>
                  <div>
                    {new Date(contact.last_interaction).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {whatsappContacts.length > 5 && (
                <Button
                  variant="link"
                  onClick={() => setShowAllContacts(!showAllContacts)}
                  className="px-0"
                >
                  {showAllContacts
                    ? "Show Less"
                    : `Show All (${whatsappContacts.length})`}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No WhatsApp contacts found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
