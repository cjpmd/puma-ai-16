import { useState, useEffect } from "react";
import { usePlayersStore } from "@/store/players";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Settings, ChevronDown, ChevronUp, Plus, Trash2, Edit } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AttributeSetting {
  id: string;
  category: string;
  name: string;
  is_enabled: boolean;
  display_name: string | null;
}

interface PlayerCategory {
  id: string;
  name: string;
  description: string | null;
}

const TeamSettings = () => {
  const updateGlobalMultiplier = usePlayersStore((state) => state.updateGlobalMultiplier);
  const globalMultiplier = usePlayersStore((state) => state.globalMultiplier);
  const [parentNotifications, setParentNotifications] = useState(false);
  const [attributesEnabled, setAttributesEnabled] = useState(false);
  const [attributeSettings, setAttributeSettings] = useState<AttributeSetting[]>([]);
  const [teamName, setTeamName] = useState("");
  const [playerCategories, setPlayerCategories] = useState<PlayerCategory[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [editingCategory, setEditingCategory] = useState<PlayerCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
    fetchAttributeSettings();
    fetchPlayerCategories();
  }, []);

  const fetchTeamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setParentNotifications(data?.parent_notification_enabled ?? false);
      setTeamName(data?.team_name ?? "");
    } catch (error) {
      console.error('Error fetching team settings:', error);
      toast({
        title: "Error",
        description: "Failed to load team settings",
        variant: "destructive",
      });
    }
  };

  const fetchPlayerCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('player_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setPlayerCategories(data || []);
    } catch (error) {
      console.error('Error fetching player categories:', error);
      toast({
        title: "Error",
        description: "Failed to load player categories",
        variant: "destructive",
      });
    }
  };

  const fetchAttributeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('attribute_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAttributeSettings(data || []);
      setAttributesEnabled(data?.some(attr => attr.is_enabled) ?? false);
    } catch (error) {
      console.error('Error fetching attribute settings:', error);
      toast({
        title: "Error",
        description: "Failed to load attribute settings",
        variant: "destructive",
      });
    }
  };

  const updateParentNotifications = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('team_settings')
        .upsert({ 
          parent_notification_enabled: enabled,
          id: '00000000-0000-0000-0000-000000000000'
        });

      if (error) throw error;
      setParentNotifications(enabled);
      toast({
        title: "Success",
        description: `Parent notifications ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating parent notifications:', error);
      toast({
        title: "Error",
        description: "Failed to update parent notification settings",
        variant: "destructive",
      });
    }
  };

  const updateTeamName = async (newName: string) => {
    try {
      const { error } = await supabase
        .from('team_settings')
        .upsert({ 
          team_name: newName,
          id: '00000000-0000-0000-0000-000000000000'
        });

      if (error) throw error;
      setTeamName(newName);
      toast({
        title: "Success",
        description: "Team name updated successfully",
      });
    } catch (error) {
      console.error('Error updating team name:', error);
      toast({
        title: "Error",
        description: "Failed to update team name",
        variant: "destructive",
      });
    }
  };

  const updateAttributeSetting = async (id: string, updates: Partial<AttributeSetting>) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setAttributeSettings(prev => 
        prev.map(attr => 
          attr.id === id ? { ...attr, ...updates } : attr
        )
      );

      toast({
        title: "Success",
        description: "Attribute setting updated successfully",
      });
    } catch (error) {
      console.error('Error updating attribute setting:', error);
      toast({
        title: "Error",
        description: "Failed to update attribute setting",
        variant: "destructive",
      });
    }
  };

  const toggleAllAttributes = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update({ is_enabled: enabled })
        .neq('id', 'dummy'); // Update all records

      if (error) throw error;

      setAttributesEnabled(enabled);
      setAttributeSettings(prev => 
        prev.map(attr => ({ ...attr, is_enabled: enabled }))
      );

      toast({
        title: "Success",
        description: `All attributes ${enabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error updating attributes:', error);
      toast({
        title: "Error",
        description: "Failed to update attributes",
        variant: "destructive",
      });
    }
  };

  const addPlayerCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('player_categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;
      setPlayerCategories([...playerCategories, data]);
      setNewCategory({ name: "", description: "" });
      toast({
        title: "Success",
        description: "Player category added successfully",
      });
    } catch (error) {
      console.error('Error adding player category:', error);
      toast({
        title: "Error",
        description: "Failed to add player category",
        variant: "destructive",
      });
    }
  };

  const updatePlayerCategory = async () => {
    if (!editingCategory) return;
    try {
      const { error } = await supabase
        .from('player_categories')
        .update(editingCategory)
        .eq('id', editingCategory.id);

      if (error) throw error;
      setPlayerCategories(playerCategories.map(cat => 
        cat.id === editingCategory.id ? editingCategory : cat
      ));
      setEditingCategory(null);
      toast({
        title: "Success",
        description: "Player category updated successfully",
      });
    } catch (error) {
      console.error('Error updating player category:', error);
      toast({
        title: "Error",
        description: "Failed to update player category",
        variant: "destructive",
      });
    }
  };

  const deletePlayerCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('player_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPlayerCategories(playerCategories.filter(cat => cat.id !== id));
      toast({
        title: "Success",
        description: "Player category deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting player category:', error);
      toast({
        title: "Error",
        description: "Failed to delete player category",
        variant: "destructive",
      });
    }
  };

  const groupedAttributes = attributeSettings.reduce((acc, attr) => {
    if (!acc[attr.category]) {
      acc[attr.category] = [];
    }
    acc[attr.category].push(attr);
    return acc;
  }, {} as Record<string, AttributeSetting[]>);

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
            <CardTitle>Team Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="max-w-sm"
              />
              <Button onClick={() => updateTeamName(teamName)}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ronaldo Player Handicap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Global Multiplier:</span>
              <Input
                type="number"
                value={globalMultiplier}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value >= 1 && value <= 2) {
                    updateGlobalMultiplier(value);
                  }
                }}
                className="w-20"
                step="0.1"
                min="1"
                max="2"
              />
              <span className="text-sm text-muted-foreground">
                (Applies to all Ronaldo players)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="parent-notifications" className="text-sm text-muted-foreground">
                Enable WhatsApp notifications for parents
              </Label>
              <Switch
                id="parent-notifications"
                checked={parentNotifications}
                onCheckedChange={updateParentNotifications}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Player Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Player Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={newCategory.description || ""}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      />
                    </div>
                    <Button onClick={addPlayerCategory} className="w-full">Add Category</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="space-y-4">
                {playerCategories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Player Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                  value={editingCategory?.name || category.name}
                                  onChange={(e) => setEditingCategory({
                                    ...category,
                                    name: e.target.value
                                  })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                  value={editingCategory?.description || category.description || ""}
                                  onChange={(e) => setEditingCategory({
                                    ...category,
                                    description: e.target.value
                                  })}
                                />
                              </div>
                              <Button onClick={updatePlayerCategory} className="w-full">
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Category</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this category? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePlayerCategory(category.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
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
            <div className="flex items-center gap-2">
              <Label htmlFor="enable-attributes" className="text-sm text-muted-foreground">
                {attributesEnabled ? 'Disable All' : 'Enable All'}
              </Label>
              <Switch
                id="enable-attributes"
                checked={attributesEnabled}
                onCheckedChange={toggleAllAttributes}
              />
            </div>
          </CardHeader>
          <CardContent>
            {attributesEnabled && (
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(groupedAttributes).map(([category, attributes]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-lg font-semibold">
                      {category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {attributes.map((attr) => (
                          <div key={attr.id} className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <Input
                                value={attr.display_name || attr.name}
                                onChange={(e) => updateAttributeSetting(attr.id, { display_name: e.target.value })}
                                className="w-full"
                              />
                            </div>
                            <Switch
                              checked={attr.is_enabled}
                              onCheckedChange={(checked) => updateAttributeSetting(attr.id, { is_enabled: checked })}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeamSettings;
