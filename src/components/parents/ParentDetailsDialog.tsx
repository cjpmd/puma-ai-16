
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Check, Loader2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [showMultipleParentsWarning, setShowMultipleParentsWarning] = useState(false);
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

      // Show warning if more than one parent is already added
      setShowMultipleParentsWarning(existingParents.length === 0 && parents.length > 1);
    }
  }, [existingParents, open]);

  const handleInputChange = (parentId: string, field: keyof Parent, value: string) => {
    setParents(parents.map(parent => 
      parent.id === parentId ? { ...parent, [field]: value } : parent
    ));
  };

  const addParent = () => {
    const newParents = [
      ...parents, 
      {
        id: 'new-' + Date.now(),
        name: '',
        email: '',
        phone: ''
      }
    ];
    
    setParents(newParents);
    // Show warning when adding a second parent
    setShowMultipleParentsWarning(existingParents.length === 0 && newParents.length > 1);
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
    
    const updatedParents = parents.filter(parent => parent.id !== parentId);
    setParents(updatedParents);
    // Update warning visibility
    setShowMultipleParentsWarning(existingParents.length === 0 && updatedParents.length > 1);
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
      
      // Handle new parents with database constraint in mind
      const newParents = parents.filter(p => p.id.startsWith('new-') && p.name.trim() !== '');
      console.log("Adding new parents:", newParents.length);
      
      if (newParents.length > 0) {
        // Due to database constraints, we can only have one parent record per player
        if (existingParentsToUpdate.length > 0) {
          // If we already have a parent, show a limitation message
          console.log("Parent record already exists - showing limitation message");
          
          const additionalInfo = newParents.map(p => 
            `${p.name}${p.email ? ` (${p.email})` : ''}${p.phone ? ` - ${p.phone}` : ''}`
          ).join(", ");
          
          toast({
            title: "Database Limitation",
            description: `Due to database constraints, only one parent record can be stored. Additional parent info: ${additionalInfo}`,
            variant: "destructive",
          });
        } else {
          // If no parents yet, we can add the first one
          const firstParent = newParents[0];
          console.log("Adding first parent:", firstParent);
          
          const { error } = await supabase
            .from('player_parents')
            .insert({
              player_id: playerId,
              name: firstParent.name,
              email: firstParent.email || null,
              phone: firstParent.phone || null,
            });
            
          if (error) {
            console.error(`Error inserting parent:`, error);
            throw error;
          }
          
          if (newParents.length > 1) {
            const additionalInfo = newParents.slice(1).map(p => 
              `${p.name}${p.email ? ` (${p.email})` : ''}${p.phone ? ` - ${p.phone}` : ''}`
            ).join(", ");
            
            toast({
              title: "Database Limitation",
              description: `Due to database constraints, only the first parent record was saved. Additional parent info: ${additionalInfo}`,
              variant: "destructive",
            });
          }
        }
      }
      
      console.log("Parent update completed with limitations");
      setSaveSuccess(true);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Parent details saved successfully with database limitations",
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
        
        {showMultipleParentsWarning && (
          <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Due to database constraints, only one parent record can be fully saved. 
              The system will save the first parent and display a summary of additional parents.
            </AlertDescription>
          </Alert>
        )}
        
        <ScrollArea className="max-h-[calc(85vh-160px)] pr-4 overflow-y-auto">
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
