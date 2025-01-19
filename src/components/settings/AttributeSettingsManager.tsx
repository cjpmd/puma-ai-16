import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AttributeSetting {
  id: string;
  category: string;
  name: string;
  is_enabled: boolean;
  display_name: string | null;
  display_order: number | null;
  is_deleted: boolean | null;
}

export function AttributeSettingsManager() {
  const [attributeSettings, setAttributeSettings] = useState<AttributeSetting[]>([]);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newAttribute, setNewAttribute] = useState({ category: "", name: "" });
  const [editingCategory, setEditingCategory] = useState<{ original: string; new: string } | null>(null);
  const [editingAttribute, setEditingAttribute] = useState<AttributeSetting | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttributeSettings();
    fetchTeamName();
  }, []);

  const fetchTeamName = async () => {
    try {
      const { data } = await supabase
        .from('team_settings')
        .select('team_name')
        .single();
      setTeamName(data?.team_name || null);
    } catch (error) {
      console.error('Error fetching team name:', error);
    }
  };

  const fetchAttributeSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('attribute_settings')
        .select('*')
        .order('category')
        .order('display_order');
      
      if (error) throw error;
      setAttributeSettings(data || []);
    } catch (error) {
      console.error('Error fetching attribute settings:', error);
      toast({
        title: "Error",
        description: "Failed to load attribute settings",
        variant: "destructive",
      });
    }
  };

  const toggleAllAttributes = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update({ is_enabled: enabled })
        .is('is_deleted', false);  // Only update non-deleted records
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `All attributes ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
      
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error toggling all attributes:', error);
      toast({
        title: "Error",
        description: "Failed to update attributes",
        variant: "destructive",
      });
    }
  };

  const toggleCategoryAttributes = async (category: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update({ is_enabled: enabled })
        .eq('category', category);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `All attributes in ${category} ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
      
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error toggling attributes:', error);
      toast({
        title: "Error",
        description: "Failed to update attributes",
        variant: "destructive",
      });
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .insert([{ category: newCategory, name: 'Default', is_enabled: true }]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category added successfully",
      });
      
      setNewCategory("");
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async (originalCategory: string, newCategoryName: string) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update({ category: newCategoryName })
        .eq('category', originalCategory);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      
      setEditingCategory(null);
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (category: string) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update({ is_deleted: true })
        .eq('category', category);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const addAttribute = async () => {
    if (!newAttribute.category || !newAttribute.name.trim()) return;
    
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .insert([{
          category: newAttribute.category,
          name: newAttribute.name,
          is_enabled: true,
        }]);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Attribute added successfully",
      });
      
      setNewAttribute({ category: "", name: "" });
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error adding attribute:', error);
      toast({
        title: "Error",
        description: "Failed to add attribute",
        variant: "destructive",
      });
    }
  };

  const updateAttribute = async (attributeId: string, updates: Partial<AttributeSetting>) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update(updates)
        .eq('id', attributeId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Attribute updated successfully",
      });
      
      setEditingAttribute(null);
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error updating attribute:', error);
      toast({
        title: "Error",
        description: "Failed to update attribute",
        variant: "destructive",
      });
    }
  };

  const deleteAttribute = async (attributeId: string) => {
    try {
      const { error } = await supabase
        .from('attribute_settings')
        .update({ is_deleted: true })
        .eq('id', attributeId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Attribute deleted successfully",
      });
      
      fetchAttributeSettings();
    } catch (error) {
      console.error('Error deleting attribute:', error);
      toast({
        title: "Error",
        description: "Failed to delete attribute",
        variant: "destructive",
      });
    }
  };

  const groupedAttributes = attributeSettings.reduce((acc, attr) => {
    if (!acc[attr.category]) {
      acc[attr.category] = [];
    }
    if (!attr.is_deleted) {
      acc[attr.category].push(attr);
    }
    return acc;
  }, {} as Record<string, AttributeSetting[]>);

  const areAllAttributesEnabled = attributeSettings
    .filter(attr => !attr.is_deleted)
    .every(attr => attr.is_enabled);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attribute Settings</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Enable All Attributes</span>
            <Switch
              checked={areAllAttributesEnabled}
              onCheckedChange={toggleAllAttributes}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={addCategory} className="w-full">
                  Add Category
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {teamName && (
        <div className="bg-secondary/20 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{teamName}</h3>
              <p className="text-sm text-muted-foreground">Team Category (System)</p>
            </div>
          </div>
        </div>
      )}

      <Accordion type="multiple" className="w-full space-y-4">
        {Object.entries(groupedAttributes).map(([category, attributes]) => (
          <AccordionItem key={category} value={category} className="border rounded-lg px-4">
            <AccordionTrigger className="flex justify-between items-center py-4">
              <div className="flex items-center gap-4">
                {editingCategory?.original === category ? (
                  <Input
                    value={editingCategory.new}
                    onChange={(e) => setEditingCategory({ ...editingCategory, new: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateCategory(category, editingCategory.new);
                      }
                    }}
                    className="w-48"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span>{category}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {category !== teamName && (
                  <>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="text-sm text-muted-foreground">Enable All</span>
                      <Switch
                        checked={attributes.every(attr => attr.is_enabled)}
                        onCheckedChange={(checked) => toggleCategoryAttributes(category, checked)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory({ original: category, new: category });
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this category? This will mark all attributes in this category as deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCategory(category)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Attribute
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Attribute</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Attribute name"
                        value={newAttribute.name}
                        onChange={(e) => setNewAttribute({ category, name: e.target.value })}
                      />
                      <Button onClick={addAttribute} className="w-full">
                        Add Attribute
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {attributes.map((attr) => (
                  <div key={attr.id} className="flex items-center justify-between gap-4 py-2">
                    {editingAttribute?.id === attr.id ? (
                      <Input
                        value={editingAttribute.name}
                        onChange={(e) => setEditingAttribute({ ...editingAttribute, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateAttribute(attr.id, { name: editingAttribute.name });
                          }
                        }}
                        className="flex-1"
                      />
                    ) : (
                      <span className="flex-1">{attr.name}</span>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={attr.is_enabled}
                        onCheckedChange={(checked) => updateAttribute(attr.id, { is_enabled: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingAttribute(attr)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Attribute</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this attribute? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAttribute(attr.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
