
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
      
      // Handle existing parents (update)
      const existingIds = existingParents?.map(p => p.id) || [];
      const currentIds = parents.filter(p => !p.id.startsWith('new-')).map(p => p.id);
      
      // Find deleted parents (existed before but not in current list)
      const deletedIds = existingIds.filter(id => !currentIds.includes(id));
      
      // Delete removed parents
      if (deletedIds.length > 0) {
        console.log("Deleting parents with IDs:", deletedIds);
        const { error: deleteError } = await supabase
          .from('player_parents')
          .delete()
          .in('id', deletedIds);
          
        if (deleteError) {
          console.error("Error deleting parents:", deleteError);
          throw deleteError;
        }
      }
      
      // Update existing parents
      for (const parent of parents.filter(p => !p.id.startsWith('new-'))) {
        console.log("Updating parent:", parent);
        const { error: updateError } = await supabase
          .from('player_parents')
          .update({ 
            name: parent.name, 
            email: parent.email, 
            phone: parent.phone 
          })
          .eq('id', parent.id);
          
        if (updateError) {
          console.error("Error updating parent:", updateError);
          throw updateError;
        }
      }
      
      // Insert new parents
      const newParents = parents.filter(p => p.id.startsWith('new-') && p.name.trim() !== '');
      if (newParents.length > 0) {
        console.log("Adding new parents:", newParents);
        const { error: insertError } = await supabase
          .from('player_parents')
          .insert(
            newParents.map(parent => ({
              player_id: playerId,
              name: parent.name,
              email: parent.email,
              phone: parent.phone
            }))
          );
          
        if (insertError) {
          console.error("Error inserting parents:", insertError);
          throw insertError;
        }
      }
      
      setSaveSuccess(true);
      
      // Show success toast and close dialog after a short delay
      toast({
        title: "Success",
        description: "Parent details saved successfully",
      });
      
      setTimeout(() => {
        onSave();
        setOpen(false);
        setSaveSuccess(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving parent details:', error);
      toast({
        title: "Error",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? String(error.message)
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
