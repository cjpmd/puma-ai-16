// Create a new implementation for WhatsAppIntegration
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WhatsAppSettings, WhatsAppContact } from "@/types/whatsAppSettings";

export function WhatsAppIntegration() {
  const [settings, setSettings] = useState<WhatsAppSettings>({
    enabled: false,
    business_phone_number: "",
    whatsapp_business_id: "",
    whatsapp_phone_id: "",
  });
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchContacts();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Check if table exists
      try {
        await supabase.rpc('create_table_if_not_exists', {
          p_table_name: 'whatsapp_settings',
          p_columns: `id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          enabled BOOLEAN DEFAULT false,
          whatsapp_business_id TEXT,
          whatsapp_phone_id TEXT,
          team_id UUID,
          business_phone_number TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()`
        });
      } catch (error) {
        console.log('Table might already exist:', error);
      }

      // Now fetch the settings
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching WhatsApp settings:", error);
        return;
      }

      if (data) {
        setSettings({
          id: data.id,
          enabled: data.enabled || false,
          whatsapp_business_id: data.whatsapp_business_id || "",
          whatsapp_phone_id: data.whatsapp_phone_id || "",
          team_id: data.team_id || "",
          business_phone_number: data.business_phone_number || "",
        });
      }
    } catch (error) {
      console.error("Error in fetchSettings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      // Try to create the table if it doesn't exist
      try {
        await supabase.rpc('create_table_if_not_exists', {
          p_table_name: 'whatsapp_contacts',
          p_columns: `id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          player_id UUID REFERENCES players(id),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()`
        });
      } catch (error) {
        console.log('Table might already exist:', error);
      }

      // Fetch contacts
      const { data, error } = await supabase
        .from('whatsapp_contacts')
        .select('*');

      if (error) {
        console.error("Error fetching WhatsApp contacts:", error);
        return;
      }

      if (data) {
        setContacts(data.map(contact => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          player_id: contact.player_id,
          created_at: contact.created_at
        })));
      }
    } catch (error) {
      console.error("Error in fetchContacts:", error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { id, ...updateData } = settings;
      
      const payload = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      let result;
      if (id) {
        // Update existing settings
        result = await supabase
          .from('whatsapp_settings')
          .update(payload)
          .eq('id', id);
      } else {
        // Insert new settings
        result = await supabase
          .from('whatsapp_settings')
          .insert([payload]);
      }

      if (result.error) {
        console.error("Error saving WhatsApp settings:", result.error);
        return;
      }

      // Refresh the settings
      fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Integration</CardTitle>
        <CardDescription>
          Configure WhatsApp integration settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enabled">Enable WhatsApp Integration</Label>
          <Switch
            id="enabled"
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, enabled: checked })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="whatsapp_business_id">WhatsApp Business ID</Label>
          <Input
            id="whatsapp_business_id"
            value={settings.whatsapp_business_id || ""}
            onChange={(e) =>
              setSettings({ ...settings, whatsapp_business_id: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="whatsapp_phone_id">WhatsApp Phone ID</Label>
          <Input
            id="whatsapp_phone_id"
            value={settings.whatsapp_phone_id || ""}
            onChange={(e) =>
              setSettings({ ...settings, whatsapp_phone_id: e.target.value })
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="business_phone_number">Business Phone Number</Label>
          <Input
            id="business_phone_number"
            value={settings.business_phone_number || ""}
            onChange={(e) =>
              setSettings({ ...settings, business_phone_number: e.target.value })
            }
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>

      <CardHeader>
        <CardTitle>WhatsApp Contacts</CardTitle>
        <CardDescription>
          List of WhatsApp contacts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>A list of your contacts on WhatsApp.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>
                  {contact.created_at
                    ? new Date(contact.created_at).toLocaleDateString()
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
