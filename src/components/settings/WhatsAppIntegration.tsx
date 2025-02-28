
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
  const { toast } = useToast();

  useEffect(() => {
    fetchWhatsAppSettings();
    fetchWhatsAppMessages();
    
    // Set the webhook URL based on the current environment
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const baseUrl = isLocalhost 
      ? "https://your-supabase-project.functions.supabase.co/whatsapp-webhook" // Placeholder for local development
      : `${window.location.protocol}//${window.location.host}/api/whatsapp-webhook`;
    
    setWebhookUrl(baseUrl);
  }, []);

  const fetchWhatsAppSettings = async () => {
    try {
      setIsLoading(true);
      
      // Check if table exists, create if not
      await supabase.rpc('execute_sql', {
        sql: `
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
      
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching WhatsApp settings:', error);
      } else {
        setWhatsappSettings(data);
      }
    } catch (error) {
      console.error('Error in WhatsApp settings setup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWhatsAppMessages = async () => {
    try {
      // Check if table exists, create if not
      await supabase.rpc('execute_sql', {
        sql: `
        CREATE TABLE IF NOT EXISTS whatsapp_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id TEXT,
          phone_number TEXT,
          message TEXT,
          raw_payload JSONB,
          processed BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );`
      });
      
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
            checked={!!whatsappSettings?.verification_token}
            onCheckedChange={(checked) => {
              if (checked && !whatsappSettings?.verification_token) {
                updateWhatsAppSettings({ verification_token: Math.random().toString(36).substring(2, 15) });
              } else if (!checked) {
                updateWhatsAppSettings({ verification_token: null });
              }
            }}
            disabled={isLoading}
          />
        </div>
        
        {whatsappSettings?.verification_token && (
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
