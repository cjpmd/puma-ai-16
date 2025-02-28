
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Bell, Users, Eye, Check, Loader2, Edit, Webhook, Lock, RefreshCcw, AlertCircle, LinkIcon } from "lucide-react";
import { AttributeSettingsManager } from "@/components/settings/AttributeSettingsManager";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Interface for WhatsApp settings
interface WhatsAppSettings {
  verification_token: string;
  api_key: string;
  phone_number_id: string;
  access_token: string;
}

// Interface for FA Connection settings
interface FAConnectionSettings {
  enabled: boolean;
  team_id: string;
  provider: string;
}

// Interface for Edge Function status
interface EdgeFunctionStatus {
  name: string;
  status: 'active' | 'inactive' | 'unknown' | 'checking';
  lastChecked: Date | null;
}

const TeamSettings = () => {
  const [teamName, setTeamName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [whatsappGroupId, setWhatsappGroupId] = useState("");
  const [savedWhatsappGroupId, setSavedWhatsappGroupId] = useState("");
  const [isEditingWhatsapp, setIsEditingWhatsapp] = useState(false);
  const [hideScoresFromParents, setHideScoresFromParents] = useState(false);
  const [format, setFormat] = useState("7-a-side");
  const [tempFormat, setTempFormat] = useState("7-a-side");
  const [categories, setCategories] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [isSavingWhatsapp, setIsSavingWhatsapp] = useState(false);
  const [whatsappSaveSuccess, setWhatsappSaveSuccess] = useState(false);
  
  // WhatsApp webhook settings
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    verification_token: "",
    api_key: "",
    phone_number_id: "",
    access_token: ""
  });
  const [isLoadingWebhookSettings, setIsLoadingWebhookSettings] = useState(false);
  const [isSavingWebhookSettings, setIsSavingWebhookSettings] = useState(false);
  const [webhookSaveSuccess, setWebhookSaveSuccess] = useState(false);
  const [webhookBaseUrl, setWebhookBaseUrl] = useState("");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{success: boolean; message: string} | null>(null);
  
  // FA Connection settings
  const [faConnectionEnabled, setFaConnectionEnabled] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [savedTeamId, setSavedTeamId] = useState("");
  const [isEditingTeamId, setIsEditingTeamId] = useState(false);
  const [isSavingTeamId, setIsSavingTeamId] = useState(false);
  const [teamIdSaveSuccess, setTeamIdSaveSuccess] = useState(false);
  const [faProvider, setFaProvider] = useState("comet");
  
  // Edge function status tracking
  const [edgeFunctions, setEdgeFunctions] = useState<EdgeFunctionStatus[]>([
    { name: 'whatsapp-webhook', status: 'unknown', lastChecked: null },
    { name: 'send-whatsapp-notification', status: 'unknown', lastChecked: null }
  ]);
  const [isCheckingFunctions, setIsCheckingFunctions] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
    fetchCategories();
    fetchWhatsAppSettings();
    fetchWebhookBaseUrl();
    fetchFAConnectionSettings();
    checkEdgeFunctions();
  }, []);

  const fetchWebhookBaseUrl = async () => {
    try {
      // Use the environment variable or the constant from the client initialization
      // Instead of accessing the protected supabaseUrl property directly
      const supabaseUrlValue = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qaecjlqraydbprsjfjdg.supabase.co';
      
      // Convert URL from https://project-ref.supabase.co to https://project-ref.supabase.co/functions/v1/whatsapp-webhook
      const baseUrl = supabaseUrlValue.replace('.co', '.co/functions/v1/whatsapp-webhook');
      setWebhookBaseUrl(baseUrl);
    } catch (error) {
      console.error('Error determining webhook URL:', error);
    }
  };

  const fetchFAConnectionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('fa_connection_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setFaConnectionEnabled(data.enabled || false);
        setTeamId(data.team_id || "");
        setSavedTeamId(data.team_id || "");
        setFaProvider(data.provider || "comet");
        setIsEditingTeamId(data.team_id ? false : true);
      }
    } catch (error) {
      console.error('Error fetching FA connection settings:', error);
      toast({
        title: "Error",
        description: "Failed to load FA connection settings",
        variant: "destructive",
      });
    }
  };

  const updateFAConnectionSettings = async (updates: Partial<FAConnectionSettings>) => {
    try {
      setIsSavingTeamId(true);
      setTeamIdSaveSuccess(false);
      
      // Check if we need to create the table first
      try {
        // Try to create the table if it doesn't exist
        const { error: tableError } = await supabase.rpc('create_table_if_not_exists', {
          p_table_name: 'fa_connection_settings',
          p_columns: 'id uuid PRIMARY KEY DEFAULT gen_random_uuid(), enabled boolean DEFAULT false, team_id text, provider text'
        });
        
        if (tableError) {
          console.warn('Could not create FA connection settings table:', tableError);
        }
      } catch (tableError) {
        console.warn('Error checking/creating tables:', tableError);
      }
      
      const { error } = await supabase
        .from('fa_connection_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000002',
          enabled: updates.enabled !== undefined ? updates.enabled : faConnectionEnabled,
          team_id: updates.team_id !== undefined ? updates.team_id : teamId,
          provider: updates.provider !== undefined ? updates.provider : faProvider
        });

      if (error) throw error;
      
      if (updates.enabled !== undefined) {
        setFaConnectionEnabled(updates.enabled);
      }
      
      if (updates.team_id !== undefined) {
        setTeamId(updates.team_id);
        setSavedTeamId(updates.team_id);
        setIsEditingTeamId(false);
      }
      
      if (updates.provider !== undefined) {
        setFaProvider(updates.provider);
      }
      
      setTeamIdSaveSuccess(true);
      
      toast({
        title: "Success",
        description: "FA connection settings updated successfully",
      });
      
      // Reset success indicator after 3 seconds
      setTimeout(() => {
        setTeamIdSaveSuccess(false);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error updating FA connection settings:', error);
      toast({
        title: "Error",
        description: `Failed to update FA connection settings: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSavingTeamId(false);
    }
  };

  const checkEdgeFunctions = async () => {
    setIsCheckingFunctions(true);
    
    try {
      // Set all functions to checking state
      setEdgeFunctions(prev => prev.map(fn => ({
        ...fn,
        status: 'checking',
        lastChecked: new Date()
      })));
      
      // Check each function by making a simple OPTIONS request
      for (const func of edgeFunctions) {
        try {
          // Get the base URL
          const supabaseUrlValue = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qaecjlqraydbprsjfjdg.supabase.co';
          const functionUrl = `${supabaseUrlValue}/functions/v1/${func.name}`;
          
          // Make an OPTIONS request which should work if the function is deployed
          const response = await fetch(functionUrl, {
            method: 'OPTIONS',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          // Update the status based on response
          setEdgeFunctions(prev => 
            prev.map(f => 
              f.name === func.name 
                ? { ...f, status: response.ok ? 'active' : 'inactive', lastChecked: new Date() }
                : f
            )
          );
        } catch (error) {
          console.error(`Error checking function ${func.name}:`, error);
          setEdgeFunctions(prev => 
            prev.map(f => 
              f.name === func.name 
                ? { ...f, status: 'inactive', lastChecked: new Date() }
                : f
            )
          );
        }
      }
    } catch (error) {
      console.error('Error checking edge functions:', error);
      toast({
        title: "Error",
        description: "Failed to check edge function status",
        variant: "destructive",
      });
    } finally {
      setIsCheckingFunctions(false);
    }
  };

  const fetchTeamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setTeamName(data?.team_name ?? "");
      setNotificationsEnabled(data?.parent_notification_enabled ?? false);
      
      // Store both current and saved whatsapp group id
      const groupId = data?.whatsapp_group_id ?? "";
      setWhatsappGroupId(groupId);
      setSavedWhatsappGroupId(groupId);
      setIsEditingWhatsapp(groupId === "");
      
      setHideScoresFromParents(data?.hide_scores_from_parents ?? false);
      setFormat(data?.format ?? "7-a-side");
      setTempFormat(data?.format ?? "7-a-side");
    } catch (error) {
      console.error('Error fetching team settings:', error);
      toast({
        title: "Error",
        description: "Failed to load team settings",
        variant: "destructive",
      });
    }
  };

  const fetchWhatsAppSettings = async () => {
    try {
      setIsLoadingWebhookSettings(true);
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setWhatsappSettings({
          verification_token: data.verification_token || "",
          api_key: data.api_key || "",
          phone_number_id: data.phone_number_id || "",
          access_token: data.access_token || ""
        });
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      toast({
        title: "Error",
        description: "Failed to load WhatsApp webhook settings",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWebhookSettings(false);
    }
  };

  const updateTeamSettings = async (updates: { 
    team_name?: string; 
    format?: string;
    hide_scores_from_parents?: boolean;
  }) => {
    try {
      const { error } = await supabase
        .from('team_settings')
        .upsert({ 
          ...updates,
          id: '00000000-0000-0000-0000-000000000000'
        });

      if (error) throw error;
      
      if (updates.team_name) setTeamName(updates.team_name);
      if (updates.format) {
        setFormat(updates.format);
        setTempFormat(updates.format);
      }
      if (updates.hide_scores_from_parents !== undefined) {
        setHideScoresFromParents(updates.hide_scores_from_parents);
      }
      
      toast({
        title: "Success",
        description: "Team settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating team settings:', error);
      toast({
        title: "Error",
        description: "Failed to update team settings",
        variant: "destructive",
      });
    }
  };

  const updateNotificationSettings = async (enabled: boolean, groupId?: string) => {
    try {
      const updates: any = {
        parent_notification_enabled: enabled,
        id: '00000000-0000-0000-0000-000000000000'
      };
      
      if (groupId !== undefined) {
        updates.whatsapp_group_id = groupId;
      }
      
      console.log('Updating notification settings with:', updates);
      
      const { error } = await supabase
        .from('team_settings')
        .upsert(updates);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setNotificationsEnabled(enabled);
      if (groupId !== undefined) {
        setWhatsappGroupId(groupId);
        setSavedWhatsappGroupId(groupId);
      }
      
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: `Failed to update notification settings: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateWhatsAppWebhookSettings = async () => {
    try {
      setIsSavingWebhookSettings(true);
      setWebhookSaveSuccess(false);
      
      // First check if values are valid
      if (!whatsappSettings.verification_token) {
        throw new Error("Verification token is required");
      }
      
      // Check if we can create the necessary tables
      try {
        // Try to create the debug logs table if it doesn't exist
        const { error: tableError } = await supabase.rpc('create_table_if_not_exists', {
          p_table_name: 'webhook_debug_logs',
          p_columns: 'id uuid PRIMARY KEY DEFAULT gen_random_uuid(), message text, data jsonb, timestamp timestamptz DEFAULT now()'
        });
        
        if (tableError) {
          console.warn('Could not create debug logs table:', tableError);
        }
      } catch (tableError) {
        console.warn('Error checking/creating tables:', tableError);
      }
      
      const { error } = await supabase
        .from('whatsapp_settings')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          verification_token: whatsappSettings.verification_token,
          api_key: whatsappSettings.api_key,
          phone_number_id: whatsappSettings.phone_number_id,
          access_token: whatsappSettings.access_token,
        });

      if (error) throw error;
      
      setWebhookSaveSuccess(true);
      
      toast({
        title: "Success",
        description: "WhatsApp webhook settings updated successfully",
      });
      
      // Reset success indicator after 3 seconds
      setTimeout(() => {
        setWebhookSaveSuccess(false);
      }, 3000);
      
      return true;
    } catch (error) {
      console.error('Error updating WhatsApp webhook settings:', error);
      toast({
        title: "Error",
        description: `Failed to update WhatsApp webhook settings: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSavingWebhookSettings(false);
    }
  };

  const testWebhookEndpoint = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    
    try {
      // Get the token from state
      const token = whatsappSettings.verification_token;
      
      if (!token) {
        throw new Error("Verification token is required to test the webhook");
      }
      
      // Call our webhook with the verify parameters
      const testUrl = `${webhookBaseUrl}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(token)}&hub.challenge=test_challenge_string`;
      
      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const responseText = await response.text();
      
      if (response.ok && responseText === "test_challenge_string") {
        setWebhookTestResult({
          success: true,
          message: "Webhook verification test successful!"
        });
      } else {
        setWebhookTestResult({
          success: false,
          message: `Webhook test failed: ${response.status} ${response.statusText}. Response: ${responseText}`
        });
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      setWebhookTestResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('player_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load player categories",
        variant: "destructive",
      });
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const { error } = await supabase
        .from('player_categories')
        .insert({ 
          name: newCategory.trim(),
          description: newDescription.trim() || null
        });

      if (error) throw error;
      setNewCategory("");
      setNewDescription("");
      fetchCategories();
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (id: string, name: string, description: string | null) => {
    try {
      const { error } = await supabase
        .from('player_categories')
        .update({ name, description })
        .eq('id', id);

      if (error) throw error;
      setEditingCategory(null);
      fetchCategories();
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('player_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const handleSaveWhatsappGroupId = async () => {
    setIsSavingWhatsapp(true);
    setWhatsappSaveSuccess(false);
    
    try {
      // First check if the column exists in the table
      const { data: columnCheck, error: columnError } = await supabase
        .rpc('get_table_columns', { table_name: 'team_settings' });
      
      console.log('Table columns:', columnCheck);
      
      if (columnError) {
        console.error('Error checking columns:', columnError);
        throw new Error(`Column check failed: ${columnError.message}`);
      }
      
      // Check if the whatsapp_group_id column exists
      const hasWhatsappColumn = columnCheck && columnCheck.some(
        (col: { column_name: string }) => col.column_name === 'whatsapp_group_id'
      );
      
      if (!hasWhatsappColumn) {
        console.log('Adding whatsapp_group_id column to team_settings table');
        // Alter table to add the column if it doesn't exist
        const { error: alterError } = await supabase
          .rpc('add_column_if_not_exists', { 
            p_table: 'team_settings', 
            p_column: 'whatsapp_group_id', 
            p_type: 'text' 
          });
          
        if (alterError) {
          console.error('Error adding column:', alterError);
          throw new Error(`Unable to add whatsapp_group_id column: ${alterError.message}`);
        }
      }
      
      // Now update with the group ID
      const success = await updateNotificationSettings(notificationsEnabled, whatsappGroupId);
      if (success) {
        setWhatsappSaveSuccess(true);
        setIsEditingWhatsapp(false);
        
        // Reset success indicator after 3 seconds
        setTimeout(() => {
          setWhatsappSaveSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error in handleSaveWhatsappGroupId:', error);
      toast({
        title: "Error",
        description: `Failed to save WhatsApp Group ID: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSavingWhatsapp(false);
    }
  };

  const handleSaveTeamId = async () => {
    await updateFAConnectionSettings({ team_id: teamId });
  };

  // Helper to generate a secure random token
  const generateVerificationToken = () => {
    const array = new Uint8Array(16); // reduced size for easier copying
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    setWhatsappSettings(prev => ({
      ...prev,
      verification_token: token
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Team Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="max-w-sm"
              />
              <Button onClick={() => updateTeamSettings({ team_name: teamName })}>
                Save Name
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Select
                value={tempFormat}
                onValueChange={setTempFormat}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-a-side">4-a-side</SelectItem>
                  <SelectItem value="5-a-side">5-a-side</SelectItem>
                  <SelectItem value="7-a-side">7-a-side</SelectItem>
                  <SelectItem value="9-a-side">9-a-side</SelectItem>
                  <SelectItem value="11-a-side">11-a-side</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => updateTeamSettings({ format: tempFormat })}
                disabled={tempFormat === format}
              >
                Save Format
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Connect to Your Regional FA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Enable FA Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect to your Regional Football Association systems for team and fixture management
                  </p>
                </div>
                <Switch
                  checked={faConnectionEnabled}
                  onCheckedChange={(checked) => updateFAConnectionSettings({ enabled: checked })}
                />
              </div>
              
              {faConnectionEnabled && (
                <div className="pt-4 space-y-6 border-t border-border">
                  <div onClick={() => window.open("https://www.scottishfacomet.co.uk/", "_blank")} className="cursor-pointer">
                    <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors">
                      <img 
                        src="https://www.scottishfa.co.uk/media/1615/scottish-fa-logo.png" 
                        alt="Scottish FA Comet" 
                        className="h-12 object-contain" 
                      />
                      <div>
                        <h3 className="font-medium">Scottish FA Comet</h3>
                        <p className="text-sm text-muted-foreground">Official team and fixture management system</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="team-id">Team ID</Label>
                    <p className="text-sm text-muted-foreground">
                      Enter your Team ID from the Comet system to link your accounts
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="team-id"
                        value={teamId}
                        onChange={(e) => setTeamId(e.target.value)}
                        placeholder="Enter Team ID"
                        className="max-w-md"
                        disabled={!isEditingTeamId && savedTeamId !== ""}
                        readOnly={!isEditingTeamId && savedTeamId !== ""}
                      />
                      {(isEditingTeamId || savedTeamId === "") ? (
                        <Button 
                          onClick={handleSaveTeamId}
                          disabled={isSavingTeamId}
                          className="min-w-[80px]"
                          variant={teamIdSaveSuccess ? "outline" : "default"}
                        >
                          {isSavingTeamId ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : teamIdSaveSuccess ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              Saved
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setIsEditingTeamId(true)}
                          variant="outline"
                          className="min-w-[80px]"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    
                    <Alert className="mt-4 bg-muted">
                      <AlertDescription>
                        <p className="text-sm">
                          Connecting to your regional FA allows automatic fixture syncing and team management.
                          API configuration will be needed to complete the setup.
                        </p>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Score Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Hide Scores from Parents</h4>
                <p className="text-sm text-muted-foreground">
                  When enabled, match scores will be hidden from parent accounts
                </p>
              </div>
              <Switch
                checked={hideScoresFromParents}
                onCheckedChange={(checked) => updateTeamSettings({ hide_scores_from_parents: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Parent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Enable Parent Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to parents about team updates and player performance
                  </p>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={updateNotificationSettings}
                />
              </div>
              
              {notificationsEnabled && (
                <div className="pt-2 space-y-4 border-t border-border">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-group-id">WhatsApp Group ID</Label>
                    <p className="text-sm text-muted-foreground">
                      Enter your WhatsApp Group ID to send notifications to a group chat
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        id="whatsapp-group-id"
                        value={whatsappGroupId}
                        onChange={(e) => setWhatsappGroupId(e.target.value)}
                        placeholder="Enter WhatsApp Group ID"
                        className="max-w-md"
                        disabled={!isEditingWhatsapp && savedWhatsappGroupId !== ""}
                        readOnly={!isEditingWhatsapp && savedWhatsappGroupId !== ""}
                      />
                      {(isEditingWhatsapp || savedWhatsappGroupId === "") ? (
                        <Button 
                          onClick={handleSaveWhatsappGroupId}
                          disabled={isSavingWhatsapp}
                          className="min-w-[80px]"
                          variant={whatsappSaveSuccess ? "outline" : "default"}
                        >
                          {isSavingWhatsapp ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : whatsappSaveSuccess ? (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              Saved
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => setIsEditingWhatsapp(true)}
                          variant="outline"
                          className="min-w-[80px]"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              WhatsApp Webhook Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Edge Function status section */}
              <div className="bg-muted p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Edge Function Status</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={checkEdgeFunctions}
                    disabled={isCheckingFunctions}
                  >
                    <RefreshCcw className={`h-4 w-4 mr-2 ${isCheckingFunctions ? 'animate-spin' : ''}`} />
                    {isCheckingFunctions ? 'Checking...' : 'Check Status'}
                  </Button>
                </div>
                <div className="space-y-2">
                  {edgeFunctions.map(func => (
                    <div key={func.name} className="flex items-center space-x-2">
                      <Badge 
                        variant={
                          func.status === 'active' ? 'default' : 
                          func.status === 'checking' ? 'outline' : 
                          'destructive'
                        }
                        className="h-6"
                      >
                        {func.status === 'checking' ? 
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : 
                          func.status === 'active' ? 
                            <Check className="h-3 w-3 mr-1" /> : 
                            <AlertCircle className="h-3 w-3 mr-1" />
                        }
                        {func.status}
                      </Badge>
                      <span className="font-mono text-sm">{func.name}</span>
                      {func.lastChecked && (
                        <span className="text-xs text-muted-foreground">
                          checked {func.lastChecked.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {edgeFunctions.some(f => f.status !== 'active') && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Deployment issue detected</AlertTitle>
                    <AlertDescription>
                      One or more edge functions may not be properly deployed. This could affect webhook functionality.
                      Please redeploy the functions or check your Supabase dashboard.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={webhookBaseUrl}
                    readOnly
                    className="bg-muted font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookBaseUrl);
                      toast({
                        title: "Copied!",
                        description: "Webhook URL copied to clipboard",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use this URL in the WhatsApp Business Platform dashboard to configure your webhook.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-token">Verification Token</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="verification-token"
                    type="text"
                    value={whatsappSettings.verification_token}
                    onChange={(e) => setWhatsappSettings(prev => ({ ...prev, verification_token: e.target.value }))}
                    placeholder="Enter verification token"
                    className="font-mono"
                  />
                  <Button 
                    variant="outline"
                    onClick={generateVerificationToken}
                    type="button"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This token is used to verify webhook requests from WhatsApp. Enter the same token in the WhatsApp Business Platform dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone-number-id">Phone Number ID</Label>
                <Input
                  id="phone-number-id"
                  type="text"
                  value={whatsappSettings.phone_number_id}
                  onChange={(e) => setWhatsappSettings(prev => ({ ...prev, phone_number_id: e.target.value }))}
                  placeholder="Enter Phone Number ID from WhatsApp Business Platform"
                />
                <p className="text-sm text-muted-foreground">
                  Find this in the WhatsApp Business Platform dashboard under your registered phone number.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key (Optional)</Label>
                <Input
                  id="api-key"
                  type="text"
                  value={whatsappSettings.api_key}
                  onChange={(e) => setWhatsappSettings(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Enter API Key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="access-token">Access Token</Label>
                <div className="relative">
                  <Input
                    id="access-token"
                    type="password"
                    value={whatsappSettings.access_token}
                    onChange={(e) => setWhatsappSettings(prev => ({ ...prev, access_token: e.target.value }))}
                    placeholder="Enter Permanent Access Token"
                    className="pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate a permanent access token in the Meta for Developers platform. This is used to authenticate API requests.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={updateWhatsAppWebhookSettings}
                  disabled={isSavingWebhookSettings}
                  className="mt-4"
                  variant={webhookSaveSuccess ? "outline" : "default"}
                >
                  {isSavingWebhookSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : webhookSaveSuccess ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Saved
                    </>
                  ) : (
                    "Save Webhook Settings"
                  )}
                </Button>
                
                <Button
                  onClick={testWebhookEndpoint}
                  disabled={isTestingWebhook || !whatsappSettings.verification_token}
                  className="mt-4"
                  variant="outline"
                >
                  {isTestingWebhook ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Webhook"
                  )}
                </Button>
              </div>
              
              {webhookTestResult && (
                <Alert variant={webhookTestResult.success ? "default" : "destructive"} className="mt-3">
                  {webhookTestResult.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{webhookTestResult.success ? "Success" : "Test Failed"}</AlertTitle>
                  <AlertDescription>
                    {webhookTestResult.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-muted p-4 rounded-lg mt-4">
                <h4 className="font-medium mb-2">Setup Instructions</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm">
                  <li>Register your app in the <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Meta for Developers</a> dashboard.</li>
                  <li>Set up the WhatsApp Business API in your Meta app.</li>
                  <li>Add a phone number to your WhatsApp business account.</li>
                  <li>Copy the Phone Number ID from the dashboard.</li>
                  <li>Generate a permanent access token with the <code className="bg-background px-1 py-0.5 rounded">whatsapp_business_messaging</code> permission.</li>
                  <li>Enter the webhook URL shown above in the Webhook configuration section.</li>
                  <li>Enter or generate a verification token here, and use the same token in the Meta dashboard.</li>
                  <li>Subscribe to webhook events for messages.</li>
                  <li>Save your settings here and test the webhook connection.</li>
                  <li>Complete the verification process in the Meta dashboard.</li>
                </ol>
              </div>
              
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Troubleshooting:</strong> If you receive a "The callback URL or verify token couldn't be validated" error from Meta,
                  ensure that: 
                  <ul className="list-disc pl-5 mt-1">
                    <li>Your Edge Functions are properly deployed (see status above)</li>
                    <li>The verification token matches exactly in both places</li>
                    <li>The webhook URL is correctly entered in the Meta dashboard</li>
                    <li>You've saved your settings here before configuring the Meta webhook</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamName && (
                <div className="bg-secondary/20 p-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{teamName}</span>
                      <p className="text-sm text-muted-foreground">Team Category (System)</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New performance category name"
                  className="max-w-sm"
                />
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Category description (optional)"
                  className="max-w-sm"
                />
                <Button onClick={addCategory}>Add Category</Button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex flex-col space-y-2 bg-secondary/20 p-3 rounded-lg">
                    {editingCategory === category.id ? (
                      <div className="space-y-2">
                        <Input
                          defaultValue={category.name}
                          className="max-w-sm"
                          onChange={(e) => {
                            const updatedCategories = categories.map(c =>
                              c.id === category.id ? { ...c, name: e.target.value } : c
                            );
                            setCategories(updatedCategories);
                          }}
                        />
                        <Input
                          defaultValue={category.description || ''}
                          className="max-w-sm"
                          placeholder="Description"
                          onChange={(e) => {
                            const updatedCategories = categories.map(c =>
                              c.id === category.id ? { ...c, description: e.target.value } : c
                            );
                            setCategories(updatedCategories);
                          }}
                        />
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              const updatedCategory = categories.find(c => c.id === category.id);
                              if (updatedCategory) {
                                updateCategory(category.id, updatedCategory.name, updatedCategory.description);
                              }
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingCategory(category.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteCategory(category.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Attribute Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Collapsible>
              <CollapsibleTrigger className="w-full text-left">
                <Button variant="ghost" className="w-full justify-start">
                  Show Attribute Settings
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <AttributeSettingsManager />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeamSettings;
