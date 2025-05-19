import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
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
      
      // Create whatsapp_settings table if it doesn't exist
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS whatsapp_settings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            verification_token TEXT,
            api_key TEXT,
            phone_number_id TEXT,
            access_token TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Insert default record if none exists
          INSERT INTO whatsapp_settings (id)
          SELECT '00000000-0000-0000-0000-000000000001'
          WHERE NOT EXISTS (SELECT 1 FROM whatsapp_settings LIMIT 1);
        `
      });
      
      // Create whatsapp_messages table if it doesn't exist
      await supabase.rpc('execute_sql', {
        sql_string: `
          CREATE TABLE IF NOT EXISTS whatsapp_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            message_id TEXT,
            phone_number TEXT,
            message TEXT,
            raw_payload JSONB,
            processed BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
        `
      });
      
      // Try to fetch settings directly
      const { data: settings, error: settingsError } = await supabase.rpc('execute_sql', {
        sql_string: `SELECT * FROM whatsapp_settings LIMIT 1;`
      });
      
      if (settingsError) {
        console.error('Error fetching WhatsApp settings:', settingsError);
      } else if (settings && settings.length > 0) {
        // Parse the first row from the result
        const setting = settings[0];
        
        // Create a properly typed WhatsAppSettings object
        const settingsData: WhatsAppSettings = {
          id: setting.id || "",
          verification_token: setting.verification_token || null,
          api_key: setting.api_key || null,
          phone_number_id: setting.phone_number_id || null,
          access_token: setting.access_token || null
        };
        
        setWhatsappSettings(settingsData);
        setIntegrationEnabled(!!setting.verification_token);
      }
      
      await fetchWhatsAppMessages();
    } catch (error) {
      console.error('Error in WhatsApp settings setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWhatsAppMessages = async () => {
    try {
      // Query the messages table directly with SQL to avoid type issues
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_string: `
          SELECT * FROM whatsapp_messages
          ORDER BY created_at DESC
          LIMIT 10;
        `
      });
      
      if (error) {
        console.error('Error fetching WhatsApp messages:', error);
      } else if (data && Array.isArray(data)) {
        // Transform the results into the WhatsAppMessage type
        const messages: WhatsAppMessage[] = data.map(row => ({
          id: row.id || '',
          phone_number: row.phone_number || '',
          message: row.message || '',
          created_at: row.created_at || '',
          processed: row.processed || false
        }));
        
        setWhatsappMessages(messages);
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
      
      // Prepare SQL update statement with proper escaping
      const updateFields = Object.entries(updates)
        .map(([key, value]) => {
          // Properly handle null values and string escaping
          const sqlValue = value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`;
          return `${key} = ${sqlValue}`;
        })
        .join(', ');
      
      const updateSQL = `
        UPDATE whatsapp_settings
        SET ${updateFields},
            updated_at = now()
        WHERE id = '${whatsappSettings.id}';
      `;
      
      const { error } = await supabase.rpc('execute_sql', {
        sql_string: updateSQL
      });
      
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
        
        {integrationEnabled && whatsappSettings && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="verification-token" className="text-sm font-medium">
                  Verification Token
                </label>
                <Input
                  id="verification-token"
                  value={whatsappSettings.verification_token || ''}
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
                  value={whatsappSettings.phone_number_id || ''}
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
                  value={whatsappSettings.access_token || ''}
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
