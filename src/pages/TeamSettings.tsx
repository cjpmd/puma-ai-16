import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Bell, Users, Eye } from "lucide-react";
import { AttributeSettingsManager } from "@/components/settings/AttributeSettingsManager";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";

const TeamSettings = () => {
  const [teamName, setTeamName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [whatsappGroupId, setWhatsappGroupId] = useState("");
  const [hideScoresFromParents, setHideScoresFromParents] = useState(false);
  const [format, setFormat] = useState("7-a-side");
  const [tempFormat, setTempFormat] = useState("7-a-side");
  const [categories, setCategories] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
    fetchCategories();
  }, []);

  const fetchTeamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setTeamName(data?.team_name ?? "");
      setNotificationsEnabled(data?.parent_notification_enabled ?? false);
      setWhatsappGroupId(data?.whatsapp_group_id ?? "");
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
      
      const { error } = await supabase
        .from('team_settings')
        .upsert(updates);

      if (error) throw error;
      setNotificationsEnabled(enabled);
      if (groupId !== undefined) {
        setWhatsappGroupId(groupId);
      }
      
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
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
    await updateNotificationSettings(notificationsEnabled, whatsappGroupId);
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
                    <FormLabel>WhatsApp Group ID</FormLabel>
                    <FormDescription>
                      Enter your WhatsApp Group ID to send notifications to a group chat
                    </FormDescription>
                    <div className="flex items-center gap-2">
                      <Input
                        value={whatsappGroupId}
                        onChange={(e) => setWhatsappGroupId(e.target.value)}
                        placeholder="Enter WhatsApp Group ID"
                        className="max-w-md"
                      />
                      <Button onClick={handleSaveWhatsappGroupId}>
                        Save
                      </Button>
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
