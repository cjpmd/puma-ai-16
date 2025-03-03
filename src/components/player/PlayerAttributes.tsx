
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Edit, Save, Sliders, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { verifyDataSaved } from "@/utils/databaseUtils";

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
  const [saveProgress, setSaveProgress] = useState(0);
  const [savingAttributeId, setSavingAttributeId] = useState<string | null>(null);
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
    // Ensure value is between 1 and 100
    const clampedValue = Math.min(100, Math.max(1, value));
    
    setEditedAttributes(prev => ({
      ...prev,
      [id]: clampedValue
    }));
  };

  const saveAttributes = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveProgress(0);
    
    // Array to collect any errors during save
    const errors: string[] = [];
    const totalAttributes = Object.keys(editedAttributes).length;
    let savedCount = 0;
    
    try {
      console.log("Saving attributes:", editedAttributes);
      
      // Update each edited attribute one by one
      for (const [id, value] of Object.entries(editedAttributes)) {
        console.log(`Updating attribute ${id} with value ${value}`);
        setSavingAttributeId(id);
        
        try {
          const { error } = await supabase
            .from('player_attributes')
            .update({ value })
            .eq('id', id);
            
          if (error) {
            console.error(`Error updating attribute ${id}:`, error);
            errors.push(`Failed to update ${attributes.find(a => a.id === id)?.name || id}: ${error.message}`);
          } else {
            // Verify the save was successful
            const verified = await verifyDataSaved('player_attributes', 'value', id, value);
            console.log(`Attribute ${id} save verified: ${verified}`);
            
            if (!verified) {
              errors.push(`Could not verify save for ${attributes.find(a => a.id === id)?.name || id}`);
            }
          }
        } catch (err) {
          console.error(`Exception updating attribute ${id}:`, err);
          errors.push(`Exception updating ${attributes.find(a => a.id === id)?.name || id}`);
        }
        
        savedCount++;
        setSaveProgress(Math.round((savedCount / totalAttributes) * 100));
      }
      
      if (errors.length > 0) {
        // Some attributes failed to save
        console.error("Some attributes failed to save:", errors);
        toast({
          title: "Partial success",
          description: `${savedCount - errors.length}/${totalAttributes} attributes saved. Some failed.`,
          variant: "destructive",
        });
      } else {
        console.log("All attributes updated successfully");
        setSaveSuccess(true);
        
        toast({
          title: "Success",
          description: "All attributes updated successfully",
        });
        
        // Delay resetting the form to show success state
        setTimeout(() => {
          setIsEditing(false);
          setEditedAttributes({});
          setSaveSuccess(false);
          setSavingAttributeId(null);
          // Force page refresh to show updated values
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating attributes:', error);
      toast({
        title: "Error",
        description: "Failed to update attributes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setSavingAttributeId(null);
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
                      Saving... {saveProgress}%
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
                          <span className={`font-semibold text-sm ${savingAttributeId === attr.id ? 'text-blue-500' : ''}`}>
                            {editedAttributes[attr.id] !== undefined ? editedAttributes[attr.id] : attr.value}
                            {savingAttributeId === attr.id && <Loader2 className="inline-block h-3 w-3 ml-2 animate-spin" />}
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
                              onChange={(e) => handleAttributeChange(attr.id, parseInt(e.target.value) || 1)}
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
