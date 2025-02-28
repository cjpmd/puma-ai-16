
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface GameFormat {
  id: string;
  name: string;
  is_default: boolean;
}

interface PerformanceCategory {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
}

export function FormatsAndCategoriesSettings() {
  const [formats, setFormats] = useState<GameFormat[]>([]);
  const [categories, setCategories] = useState<PerformanceCategory[]>([]);
  const [newFormat, setNewFormat] = useState("");
  const [defaultFormat, setDefaultFormat] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [defaultCategory, setDefaultCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setupTables();
  }, []);

  const setupTables = async () => {
    try {
      setIsLoading(true);
      
      // Create tables if they don't exist
      await supabase.rpc('execute_sql', {
        sql: `
        -- Create game_formats table if it doesn't exist
        CREATE TABLE IF NOT EXISTS game_formats (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL UNIQUE,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Create performance_categories table if it doesn't exist
        CREATE TABLE IF NOT EXISTS performance_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Insert default formats if none exist
        INSERT INTO game_formats (name, is_default)
        SELECT '4-a-side', false
        WHERE NOT EXISTS (SELECT 1 FROM game_formats WHERE name = '4-a-side');
        
        INSERT INTO game_formats (name, is_default)
        SELECT '5-a-side', false
        WHERE NOT EXISTS (SELECT 1 FROM game_formats WHERE name = '5-a-side');
        
        INSERT INTO game_formats (name, is_default)
        SELECT '7-a-side', true
        WHERE NOT EXISTS (SELECT 1 FROM game_formats WHERE name = '7-a-side');
        
        INSERT INTO game_formats (name, is_default)
        SELECT '9-a-side', false
        WHERE NOT EXISTS (SELECT 1 FROM game_formats WHERE name = '9-a-side');
        
        INSERT INTO game_formats (name, is_default)
        SELECT '11-a-side', false
        WHERE NOT EXISTS (SELECT 1 FROM game_formats WHERE name = '11-a-side');
        
        -- Insert default performance categories if none exist
        INSERT INTO performance_categories (name, description, is_default)
        SELECT 'MESSI', 'Top performance category', true
        WHERE NOT EXISTS (SELECT 1 FROM performance_categories WHERE name = 'MESSI');
        
        INSERT INTO performance_categories (name, description, is_default)
        SELECT 'RONALDO', 'Middle performance category', false
        WHERE NOT EXISTS (SELECT 1 FROM performance_categories WHERE name = 'RONALDO');
        
        INSERT INTO performance_categories (name, description, is_default)
        SELECT 'JAGS', 'Developing performance category', false
        WHERE NOT EXISTS (SELECT 1 FROM performance_categories WHERE name = 'JAGS');
        
        -- Ensure at least one format and category is set as default
        UPDATE game_formats SET is_default = true 
        WHERE id = (SELECT id FROM game_formats LIMIT 1)
        AND NOT EXISTS (SELECT 1 FROM game_formats WHERE is_default = true);
        
        UPDATE performance_categories SET is_default = true 
        WHERE id = (SELECT id FROM performance_categories LIMIT 1)
        AND NOT EXISTS (SELECT 1 FROM performance_categories WHERE is_default = true);
        `
      });
      
      // Fetch formats and categories after setup
      await Promise.all([fetchFormats(), fetchCategories()]);
    } catch (error) {
      console.error('Error in formats and categories setup:', error);
      toast({
        title: "Error",
        description: "Failed to set up formats and categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFormats = async () => {
    try {
      const { data, error } = await supabase
        .from('game_formats')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setFormats(data || []);
      
      // Set default format selector
      const defaultFmt = data?.find(f => f.is_default)?.name || "";
      setDefaultFormat(defaultFmt);
    } catch (error) {
      console.error('Error fetching game formats:', error);
      toast({
        title: "Error",
        description: "Failed to load game formats",
        variant: "destructive",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
      
      // Set default category selector
      const defaultCat = data?.find(c => c.is_default)?.name || "";
      setDefaultCategory(defaultCat);
    } catch (error) {
      console.error('Error fetching performance categories:', error);
      toast({
        title: "Error",
        description: "Failed to load performance categories",
        variant: "destructive",
      });
    }
  };

  const addFormat = async () => {
    if (!newFormat.trim()) {
      toast({
        title: "Error",
        description: "Format name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('game_formats')
        .insert([{ name: newFormat, is_default: formats.length === 0 }])
        .select()
        .single();
      
      if (error) throw error;
      
      setFormats([...formats, data]);
      setNewFormat("");
      
      toast({
        title: "Success",
        description: "Game format added successfully",
      });
      
      if (formats.length === 0) {
        setDefaultFormat(data.name);
      }
    } catch (error) {
      console.error('Error adding game format:', error);
      toast({
        title: "Error",
        description: "Failed to add game format",
        variant: "destructive",
      });
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Error",
        description: "Category name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('performance_categories')
        .insert([{ 
          name: newCategory, 
          description: newCategoryDescription || null,
          is_default: categories.length === 0 
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      setCategories([...categories, data]);
      setNewCategory("");
      setNewCategoryDescription("");
      
      toast({
        title: "Success",
        description: "Performance category added successfully",
      });
      
      if (categories.length === 0) {
        setDefaultCategory(data.name);
      }
    } catch (error) {
      console.error('Error adding performance category:', error);
      toast({
        title: "Error",
        description: "Failed to add performance category",
        variant: "destructive",
      });
    }
  };

  const deleteFormat = async (formatId: string, formatName: string) => {
    try {
      const { error } = await supabase
        .from('game_formats')
        .delete()
        .eq('id', formatId);
      
      if (error) throw error;
      
      const updatedFormats = formats.filter(format => format.id !== formatId);
      setFormats(updatedFormats);
      
      // If we deleted the default format, set a new default
      const deletedDefault = formats.find(f => f.id === formatId)?.is_default;
      if (deletedDefault && updatedFormats.length > 0) {
        await setFormatAsDefault(updatedFormats[0].id);
        setDefaultFormat(updatedFormats[0].name);
      }
      
      toast({
        title: "Success",
        description: `Game format "${formatName}" deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting game format:', error);
      toast({
        title: "Error",
        description: "Failed to delete game format",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string, categoryName: string) => {
    try {
      const { error } = await supabase
        .from('performance_categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
      const updatedCategories = categories.filter(category => category.id !== categoryId);
      setCategories(updatedCategories);
      
      // If we deleted the default category, set a new default
      const deletedDefault = categories.find(c => c.id === categoryId)?.is_default;
      if (deletedDefault && updatedCategories.length > 0) {
        await setCategoryAsDefault(updatedCategories[0].id);
        setDefaultCategory(updatedCategories[0].name);
      }
      
      toast({
        title: "Success",
        description: `Performance category "${categoryName}" deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting performance category:', error);
      toast({
        title: "Error",
        description: "Failed to delete performance category",
        variant: "destructive",
      });
    }
  };

  const setFormatAsDefault = async (formatId: string) => {
    try {
      // First, clear all defaults
      await supabase
        .from('game_formats')
        .update({ is_default: false })
        .neq('id', formatId);
      
      // Then set the new default
      const { error } = await supabase
        .from('game_formats')
        .update({ is_default: true })
        .eq('id', formatId);
      
      if (error) throw error;
      
      // Update local state
      const updatedFormats = formats.map(format => ({
        ...format,
        is_default: format.id === formatId
      }));
      setFormats(updatedFormats);
      
      const newDefaultName = formats.find(f => f.id === formatId)?.name || "";
      setDefaultFormat(newDefaultName);
      
      toast({
        title: "Success",
        description: "Default game format updated successfully",
      });
    } catch (error) {
      console.error('Error setting default format:', error);
      toast({
        title: "Error",
        description: "Failed to update default format",
        variant: "destructive",
      });
    }
  };

  const setCategoryAsDefault = async (categoryId: string) => {
    try {
      // First, clear all defaults
      await supabase
        .from('performance_categories')
        .update({ is_default: false })
        .neq('id', categoryId);
      
      // Then set the new default
      const { error } = await supabase
        .from('performance_categories')
        .update({ is_default: true })
        .eq('id', categoryId);
      
      if (error) throw error;
      
      // Update local state
      const updatedCategories = categories.map(category => ({
        ...category,
        is_default: category.id === categoryId
      }));
      setCategories(updatedCategories);
      
      const newDefaultName = categories.find(c => c.id === categoryId)?.name || "";
      setDefaultCategory(newDefaultName);
      
      toast({
        title: "Success",
        description: "Default performance category updated successfully",
      });
    } catch (error) {
      console.error('Error setting default category:', error);
      toast({
        title: "Error",
        description: "Failed to update default category",
        variant: "destructive",
      });
    }
  };

  const handleDefaultFormatChange = (formatName: string) => {
    const formatId = formats.find(f => f.name === formatName)?.id;
    if (formatId) {
      setFormatAsDefault(formatId);
    }
  };

  const handleDefaultCategoryChange = (categoryName: string) => {
    const categoryId = categories.find(c => c.name === categoryName)?.id;
    if (categoryId) {
      setCategoryAsDefault(categoryId);
    }
  };

  return (
    <div className="space-y-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Formats</CardTitle>
          <CardDescription>
            Manage game formats and set the default format for new events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Default Game Format</h3>
                <Select
                  value={defaultFormat}
                  onValueChange={handleDefaultFormatChange}
                  disabled={isLoading || formats.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select default format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map((format) => (
                      <SelectItem key={format.id} value={format.name}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-2">Add New Format</h3>
                  <Input
                    placeholder="New format (e.g., 3-a-side)"
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={addFormat}
                  disabled={isLoading || !newFormat.trim()}
                  className="flex-shrink-0"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Current Formats</h3>
              {formats.length === 0 ? (
                <p className="text-sm text-muted-foreground">No formats defined yet</p>
              ) : (
                <div className="space-y-2">
                  {formats.map((format) => (
                    <div key={format.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{format.name}</span>
                        {format.is_default && (
                          <span className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isLoading || format.is_default}>
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Format</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{format.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteFormat(format.id, format.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Categories</CardTitle>
          <CardDescription>
            Manage performance categories and set the default for team assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Default Performance Category</h3>
                <Select
                  value={defaultCategory}
                  onValueChange={handleDefaultCategoryChange}
                  disabled={isLoading || categories.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select default category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-medium mb-2">Add New Category</h3>
                  <div className="space-y-2">
                    <Input
                      placeholder="Category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      disabled={isLoading}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newCategoryDescription}
                      onChange={(e) => setNewCategoryDescription(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  onClick={addCategory}
                  disabled={isLoading || !newCategory.trim()}
                  className="flex-shrink-0"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-3">
              <h3 className="font-medium mb-2">Current Categories</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories defined yet</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{category.name}</span>
                          {category.is_default && (
                            <span className="bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                              Default
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <span className="text-xs text-muted-foreground">{category.description}</span>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isLoading || category.is_default}>
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteCategory(category.id, category.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
