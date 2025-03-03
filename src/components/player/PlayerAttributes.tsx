
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Edit, Save, Sliders, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AttributeCategory } from "@/types/player";
import { Label } from "@/components/ui/label";

interface PlayerAttributesProps {
  attributes: Array<{
    id: string
    name: string
    value: number
    category?: string
  }>;
  playerId: string;
  playerType: string;
  playerCategory: string;
}

export function PlayerAttributes({ attributes, playerId, playerType, playerCategory }: PlayerAttributesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttributes, setEditedAttributes] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset when canceling edit mode
      setEditedAttributes({});
      setSaveSuccess(false);
    }
    setIsEditing(!isEditing);
  };

  const handleAttributeChange = (id: string, value: number) => {
    setEditedAttributes(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveAttributes = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Update each edited attribute
      const promises = Object.entries(editedAttributes).map(([id, value]) => {
        return supabase
          .from('player_attributes')
          .update({ value })
          .eq('id', id);
      });
      
      const results = await Promise.all(promises);
      
      // Check for any errors
      const errors = results.filter(result => result.error).map(result => result.error);
      if (errors.length > 0) {
        console.error('Errors updating attributes:', errors);
        throw new Error(`${errors.length} attributes failed to update`);
      }
      
      setSaveSuccess(true);
      
      toast({
        title: "Success",
        description: "Attributes updated successfully",
      });
      
      // Delay resetting the form to show success state
      setTimeout(() => {
        setIsEditing(false);
        setEditedAttributes({});
        setSaveSuccess(false);
      }, 1000);
    } catch (error) {
      console.error('Error updating attributes:', error);
      toast({
        title: "Error",
        description: "Failed to update attributes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Group attributes by category
  const groupedAttributes = attributes.reduce((acc, attr) => {
    const category = attr.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(attr);
    return acc;
  }, {} as Record<string, typeof attributes>);

  // Sort categories in a specific order
  const sortedCategories = Object.keys(groupedAttributes).sort((a, b) => {
    const order = ['TECHNICAL', 'MENTAL', 'PHYSICAL', 'GOALKEEPING'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const categoryNames: Record<string, string> = {
    TECHNICAL: 'Technical',
    MENTAL: 'Mental',
    PHYSICAL: 'Physical',
    GOALKEEPING: 'Goalkeeping'
  };

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-6 hover:bg-accent/5 transition-colors">
          <h3 className="text-xl font-semibold">Attributes</h3>
          <ChevronDown className="h-5 w-5" />
        </CollapsibleTrigger>
        <CollapsibleContent className="p-6 pt-0">
          <div className="flex justify-end mb-4">
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveAttributes} 
                  disabled={isSaving || Object.keys(editedAttributes).length === 0}
                  className={saveSuccess ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : saveSuccess ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Saved!
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleEditToggle}
              >
                Edit Attributes
                <Edit className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Accordion type="multiple" defaultValue={sortedCategories} className="space-y-4">
            {sortedCategories.map((category) => (
              <AccordionItem key={category} value={category} className="border rounded-md overflow-hidden">
                <AccordionTrigger className="px-4 py-2 hover:bg-accent/5">
                  <span className="font-semibold">{categoryNames[category] || category}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2">
                  <ul className="space-y-4">
                    {groupedAttributes[category].map((attr) => (
                      <li key={attr.id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <Label htmlFor={`attr-${attr.id}`} className="text-sm text-gray-700">
                            {attr.name}
                          </Label>
                          <span className="font-semibold text-sm">
                            {editedAttributes[attr.id] !== undefined ? editedAttributes[attr.id] : attr.value}
                          </span>
                        </div>
                        {isEditing && (
                          <div className="flex items-center gap-2">
                            <Sliders className="h-4 w-4 text-gray-500" />
                            <input
                              id={`attr-${attr.id}`}
                              type="range"
                              min="1"
                              max="100"
                              value={editedAttributes[attr.id] !== undefined ? editedAttributes[attr.id] : attr.value}
                              onChange={(e) => handleAttributeChange(attr.id, parseInt(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <Input 
                              type="number" 
                              min="1" 
                              max="100" 
                              className="w-16 text-right"
                              value={editedAttributes[attr.id] !== undefined ? editedAttributes[attr.id] : attr.value}
                              onChange={(e) => handleAttributeChange(attr.id, parseInt(e.target.value))}
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
