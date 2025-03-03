
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Check, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Parent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

interface ParentDetailsDialogProps {
  playerId: string;
  existingParents?: Parent[];
  onSave: () => void;
}

export const ParentDetailsDialog = ({ playerId, existingParents = [], onSave }: ParentDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize the form with existing parents or a new blank one
    if (open) {
      console.log("Initializing parent form with:", existingParents);
      if (existingParents.length > 0) {
        setParents([...existingParents]);
      } else {
        setParents([{
          id: 'new-' + Date.now(),
          name: '',
          email: '',
          phone: ''
        }]);
      }
    }
  }, [existingParents, open]);

  const handleInputChange = (parentId: string, field: keyof Parent, value: string) => {
    setParents(parents.map(parent => 
      parent.id === parentId ? { ...parent, [field]: value } : parent
    ));
  };

  const addParent = () => {
    setParents([
      ...parents, 
      {
        id: 'new-' + Date.now(),
        name: '',
        email: '',
        phone: ''
      }
    ]);
  };

  const removeParent = (parentId: string) => {
    if (parents.length === 1) {
      toast({
        title: "Cannot remove",
        description: "At least one parent details must be provided",
        variant: "destructive",
      });
      return;
    }
    
    setParents(parents.filter(parent => parent.id !== parentId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);
    
    try {
      // Validate that at least one parent has a name
      const hasValidParent = parents.some(parent => parent.name.trim() !== '');
      if (!hasValidParent) {
        throw new Error("At least one parent must have a name");
      }
      
      console.log("Saving parents:", parents);
      
      // Delete parents that were removed (exist in database but not in current list)
      const existingIds = existingParents?.map(p => p.id) || [];
      const currentIds = parents.filter(p => !p.id.startsWith('new-')).map(p => p.id);
      const deletedIds = existingIds.filter(id => !currentIds.includes(id));
      
      if (deletedIds.length > 0) {
        console.log("Deleting parents with IDs:", deletedIds);
        for (const id of deletedIds) {
          const { error } = await supabase
            .from('player_parents')
            .delete()
            .eq('id', id);
            
          if (error) {
            console.error(`Error deleting parent ${id}:`, error);
            throw error;
          }
        }
      }
      
      // Update existing parents one by one
      const existingParentsToUpdate = parents.filter(p => !p.id.startsWith('new-') && p.name.trim() !== '');
      console.log("Updating existing parents:", existingParentsToUpdate.length);
      
      for (const parent of existingParentsToUpdate) {
        console.log("Updating parent:", parent);
        const { error } = await supabase
          .from('player_parents')
          .update({ 
            name: parent.name, 
            email: parent.email || null, 
            phone: parent.phone || null 
          })
          .eq('id', parent.id);
          
        if (error) {
          console.error(`Error updating parent ${parent.id}:`, error);
          throw error;
        }
      }
      
      // Handle new parents - FIXED: Check if any parents already exist
      const newParents = parents.filter(p => p.id.startsWith('new-') && p.name.trim() !== '');
      console.log("Adding new parents:", newParents.length);
      
      // Fix for constraint violation: Check if this player already has parents to determine approach
      const hasExistingParents = existingParentsToUpdate.length > 0;
      
      if (newParents.length > 0) {
        if (hasExistingParents) {
          console.log("Player already has parents - using update approach for new parents");
          // Get the first existing parent to update additional details
          const parentToUpdate = existingParentsToUpdate[0].id;
          
          // Add parent info to existing notes
          for (const parent of newParents) {
            const noteUpdate = `Additional parent: ${parent.name}${parent.email ? `, Email: ${parent.email}` : ''}${parent.phone ? `, Phone: ${parent.phone}` : ''}`;
            
            // Update an existing field with this information
            const { error } = await supabase
              .from('player_parents')
              .update({ 
                notes: noteUpdate
              })
              .eq('id', parentToUpdate);
              
            if (error) {
              console.error(`Error adding parent info to notes:`, error);
              throw error;
            }
          }
          
          toast({
            title: "Success with limitations",
            description: "Due to database constraints, additional parents are added as notes to the main parent record",
          });
        } else {
          // If no parents yet, we can add the first one normally
          const firstParent = newParents[0];
          console.log("Adding first parent:", firstParent);
          
          // Create notes field if more than one parent
          let notes = '';
          if (newParents.length > 1) {
            notes = newParents.slice(1).map(p => 
              `Additional parent: ${p.name}${p.email ? `, Email: ${p.email}` : ''}${p.phone ? `, Phone: ${p.phone}` : ''}`
            ).join('\n');
          }
          
          const { error } = await supabase
            .from('player_parents')
            .insert({
              player_id: playerId,
              name: firstParent.name,
              email: firstParent.email || null,
              phone: firstParent.phone || null,
              notes: notes || null
            });
            
          if (error) {
            console.error(`Error inserting parent:`, error);
            throw error;
          }
          
          if (newParents.length > 1) {
            toast({
              title: "Success with limitations",
              description: "Due to database constraints, additional parents are added as notes to the main parent record",
            });
          }
        }
      }
      
      console.log("All parent updates completed successfully");
      setSaveSuccess(true);
      
      // Show success toast and close dialog after a short delay
      toast({
        title: "Success",
        description: "Parent details saved successfully",
      });
      
      // Run the onSave callback to refresh the parent list
      onSave();
      
      // Close dialog after a short delay to show success state
      setTimeout(() => {
        setOpen(false);
        setSaveSuccess(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving parent details:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String((error as any).message)
          : "Failed to save parent details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {existingParents && existingParents.length > 0 ? "Edit Parent Details" : "Add Parent Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>
            {existingParents && existingParents.length > 0 ? "Edit Parent Details" : "Add Parent Details"}
          </DialogTitle>
          <DialogDescription>
            Manage parent contact information for this player.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-120px)] pr-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {parents.map((parent, index) => (
              <div key={parent.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Parent {index + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParent(parent.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`name-${parent.id}`}>Name *</Label>
                  <Input
                    id={`name-${parent.id}`}
                    value={parent.name || ''}
                    onChange={(e) => handleInputChange(parent.id, 'name', e.target.value)}
                    required={index === 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${parent.id}`}>Email</Label>
                  <Input
                    id={`email-${parent.id}`}
                    type="email"
                    value={parent.email || ''}
                    onChange={(e) => handleInputChange(parent.id, 'email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`phone-${parent.id}`}>Phone</Label>
                  <Input
                    id={`phone-${parent.id}`}
                    type="tel"
                    value={parent.phone || ''}
                    onChange={(e) => handleInputChange(parent.id, 'phone', e.target.value)}
                  />
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={addParent}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Parent
            </Button>
            
            <Button 
              type="submit" 
              className={`w-full transition-all ${saveSuccess ? 'bg-green-500 hover:bg-green-600' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : saveSuccess ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Saved!
                </span>
              ) : (
                'Save'
              )}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
