
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, Copy, X } from "lucide-react";

interface WhatsAppSettings {
  id: string;
  verification_token: string | null;
  api_key: string | null;
  phone_number_id: string | null;
  access_token: string | null;
}

interface WhatsAppMessage {
  id: string;
  phone_number: string;
  message: string;
  created_at: string;
  processed: boolean;
}

export function WhatsAppIntegration() {
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings | null>(null);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [integrationEnabled, setIntegrationEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setupTablesAndLoadData();
    
    // Set the webhook URL based on the current environment
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocalhost 
      ? "https://your-supabase-project.functions.supabase.co/whatsapp-webhook" // Placeholder for local development
      : `${window.location.protocol}//${window.location.host}/api/whatsapp-webhook`;
    
    setWebhookUrl(baseUrl);
  }, []);

  const setupTablesAndLoadData = async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch settings directly
      const { data: settings, error: settingsError } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .limit(1);
      
      if (settingsError) {
        if (settingsError.code === '42P01') {
          // Table doesn't exist, create it
          await createWhatsAppTables();
          await fetchWhatsAppSettings();
        } else {
          console.error('Error fetching WhatsApp settings:', settingsError);
        }
      } else if (settings && settings.length > 0) {
        setWhatsappSettings(settings[0]);
        setIntegrationEnabled(!!settings[0].verification_token);
      } else {
        // No settings found, create default
        await createDefaultWhatsAppSettings();
        await fetchWhatsAppSettings();
      }
      
      await fetchWhatsAppMessages();
    } catch (error) {
      console.error('Error in WhatsApp settings setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createWhatsAppTables = async () => {
    try {
      // Create whatsapp_settings table
      const { error: settingsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'whatsapp_settings',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          verification_token TEXT,
          api_key TEXT,
          phone_number_id TEXT,
          access_token TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        `
      });
      
      if (settingsError) {
        console.error('Error creating whatsapp_settings table:', settingsError);
        // Try direct approach
        await supabase.from('whatsapp_settings').insert([{
          id: '00000000-0000-0000-0000-000000000001',
          verification_token: null,
          api_key: null,
          phone_number_id: null,
          access_token: null
        }]);
      }
      
      // Create whatsapp_messages table
      const { error: messagesError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'whatsapp_messages',
        table_definition: `
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id TEXT,
          phone_number TEXT,
          message TEXT,
          raw_payload JSONB,
          processed BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        `
      });
      
      if (messagesError) {
        console.error('Error creating whatsapp_messages table:', messagesError);
      }
    } catch (error) {
      console.error('Error creating WhatsApp tables:', error);
    }
  };

  const createDefaultWhatsAppSettings = async () => {
    try {
      const { error } = await supabase
        .from('whatsapp_settings')
        .insert([
          {
            id: '00000000-0000-0000-0000-000000000001',
            verification_token: null,
            api_key: null,
            phone_number_id: null,
            access_token: null
          }
        ]);
      
      if (error) {
        console.error('Error creating default WhatsApp settings:', error);
      }
    } catch (error) {
      console.error('Error creating default WhatsApp settings:', error);
    }
  };

  const fetchWhatsAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching WhatsApp settings:', error);
      } else {
        setWhatsappSettings(data);
        setIntegrationEnabled(!!data.verification_token);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
    }
  };

  const fetchWhatsAppMessages = async () => {
    try {
      // Check if table exists first
      const { error: checkError } = await supabase
        .from('whatsapp_messages')
        .select('count(*)')
        .limit(1);
      
      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist, create it
        await createWhatsAppTables();
        return; // No messages to fetch yet
      }
      
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching WhatsApp messages:', error);
      } else {
        setWhatsappMessages(data || []);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp messages:', error);
    }
  };

  const updateWhatsAppSettings = async (updates: Partial<WhatsAppSettings>) => {
    if (!whatsappSettings) return;
    
    try {
      // Optimistically update UI state
      const updatedSettings = { ...whatsappSettings, ...updates };
      setWhatsappSettings(updatedSettings);
      
      const { error } = await supabase
        .from('whatsapp_settings')
        .update(updates)
        .eq('id', whatsappSettings.id);
      
      if (error) {
        console.error('Error updating WhatsApp settings:', error);
        // Revert UI state on error
        setWhatsappSettings(whatsappSettings);
        toast({
          title: "Error",
          description: "Failed to update WhatsApp settings",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "WhatsApp settings updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const toggleWhatsAppIntegration = (enabled: boolean) => {
    if (enabled) {
      updateWhatsAppSettings({ 
        verification_token: Math.random().toString(36).substring(2, 15) 
      });
      setIntegrationEnabled(true);
    } else {
      updateWhatsAppSettings({ 
        verification_token: null,
        api_key: null,
        phone_number_id: null,
        access_token: null
      });
      setIntegrationEnabled(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: "The webhook URL has been copied to clipboard",
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>WhatsApp Integration</CardTitle>
        <CardDescription>
          Set up WhatsApp API integration to send notifications and receive responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-medium">Enable WhatsApp Integration</h3>
            <p className="text-sm text-muted-foreground">
              Connect to WhatsApp Business API for team communications
            </p>
          </div>
          <Switch
            checked={integrationEnabled}
            onCheckedChange={toggleWhatsAppIntegration}
            disabled={isLoading}
          />
        </div>
        
        {integrationEnabled && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="verification-token" className="text-sm font-medium">
                  Verification Token
                </label>
                <Input
                  id="verification-token"
                  value={whatsappSettings?.verification_token || ''}
                  onChange={(e) => updateWhatsAppSettings({ verification_token: e.target.value })}
                  placeholder="Verification token for webhook"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="phone-number-id" className="text-sm font-medium">
                  Phone Number ID
                </label>
                <Input
                  id="phone-number-id"
                  value={whatsappSettings?.phone_number_id || ''}
                  onChange={(e) => updateWhatsAppSettings({ phone_number_id: e.target.value })}
                  placeholder="Your WhatsApp phone number ID"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="access-token" className="text-sm font-medium">
                  Access Token
                </label>
                <Input
                  id="access-token"
                  type="password"
                  value={whatsappSettings?.access_token || ''}
                  onChange={(e) => updateWhatsAppSettings({ access_token: e.target.value })}
                  placeholder="Your WhatsApp API access token"
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-2">Webhook Configuration</h3>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  value={webhookUrl}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhookUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Use this URL in your WhatsApp Business API configuration as a webhook endpoint. 
                The verification token above will be used to validate the webhook.
              </p>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-base font-medium mb-2">Recent Messages</h3>
              {whatsappMessages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {whatsappMessages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell>{msg.phone_number}</TableCell>
                        <TableCell>{msg.message}</TableCell>
                        <TableCell>{new Date(msg.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {msg.processed ? 
                            <Check className="h-4 w-4 text-green-500" /> : 
                            <X className="h-4 w-4 text-red-500" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No messages received yet</p>
              )}
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={fetchWhatsAppMessages}
                  disabled={isLoading}
                >
                  Refresh Messages
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
