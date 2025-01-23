import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ParentDetailsDialogProps {
  playerId: string;
  existingParent?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  onSave: () => void;
}

export const ParentDetailsDialog = ({ playerId, existingParent, onSave }: ParentDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existingParent?.name || "");
  const [email, setEmail] = useState(existingParent?.email || "");
  const [phone, setPhone] = useState(existingParent?.phone || "");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (existingParent) {
        await supabase
          .from('player_parents')
          .update({ name, email, phone })
          .eq('id', existingParent.id);
      } else {
        await supabase
          .from('player_parents')
          .insert([{ player_id: playerId, name, email, phone }]);
      }
      
      toast({
        title: "Success",
        description: `Parent details ${existingParent ? 'updated' : 'added'} successfully`,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={existingParent ? "outline" : "default"}>
          {existingParent ? "Edit Parent Details" : "Add Parent Details"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingParent ? "Edit Parent Details" : "Add Parent Details"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Save
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};