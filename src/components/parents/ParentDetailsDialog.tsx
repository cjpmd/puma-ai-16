
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";

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
  }, [existingParents]);

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
    
    try {
      // Handle existing parents (update)
      const existingIds = existingParents?.map(p => p.id) || [];
      const currentIds = parents.filter(p => !p.id.startsWith('new-')).map(p => p.id);
      
      // Find deleted parents (existed before but not in current list)
      const deletedIds = existingIds.filter(id => !currentIds.includes(id));
      
      // Delete removed parents
      if (deletedIds.length > 0) {
        await supabase
          .from('player_parents')
          .delete()
          .in('id', deletedIds);
      }
      
      // Update existing parents
      for (const parent of parents.filter(p => !p.id.startsWith('new-'))) {
        await supabase
          .from('player_parents')
          .update({ 
            name: parent.name, 
            email: parent.email, 
            phone: parent.phone 
          })
          .eq('id', parent.id);
      }
      
      // Insert new parents
      const newParents = parents.filter(p => p.id.startsWith('new-'));
      if (newParents.length > 0) {
        await supabase
          .from('player_parents')
          .insert(
            newParents.map(parent => ({
              player_id: playerId,
              name: parent.name,
              email: parent.email,
              phone: parent.phone
            }))
          );
      }
      
      toast({
        title: "Success",
        description: "Parent details saved successfully",
      });
      onSave();
      setOpen(false);
    } catch (error) {
      console.error('Error saving parent details:', error);
      toast({
        title: "Error",
        description: "Failed to save parent details",
        variant: "destructive",
      });
    }
  };

  const dialogTitle = existingParents && existingParents.length > 0 ? "Edit Parent Details" : "Add Parent Details";
  const buttonText = existingParents && existingParents.length > 0 ? "Edit Parent Details" : "Add Parent Details";
  const buttonVariant = existingParents && existingParents.length > 0 ? "outline" : "default";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant as any}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
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
                  value={parent.name}
                  onChange={(e) => handleInputChange(parent.id, 'name', e.target.value)}
                  required
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
          
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
