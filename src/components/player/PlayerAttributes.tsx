
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset when canceling edit mode
      setEditedAttributes({});
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
    try {
      // Update each edited attribute
      for (const [id, value] of Object.entries(editedAttributes)) {
        const { error } = await supabase
          .from('player_attributes')
          .update({ value })
          .eq('id', id);
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: "Attributes updated successfully",
      });
      
      setIsEditing(false);
      setEditedAttributes({});
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
                >
                  {isSaving ? "Saving..." : "Save"}
                  <Save className="ml-2 h-4 w-4" />
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
          
          <ul className="space-y-2">
            {attributes?.map((attr) => (
              <li key={attr.id} className="flex justify-between items-center">
                <span className="text-gray-700">{attr.name}</span>
                {isEditing ? (
                  <Input 
                    type="number" 
                    min="1" 
                    max="100" 
                    className="w-20 text-right"
                    value={editedAttributes[attr.id] !== undefined ? editedAttributes[attr.id] : attr.value}
                    onChange={(e) => handleAttributeChange(attr.id, parseInt(e.target.value))}
                  />
                ) : (
                  <span className="font-semibold">{attr.value}</span>
                )}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
