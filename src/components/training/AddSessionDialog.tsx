import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AddSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onAdd: () => void;
  selectedDate?: Date;
  category?: string;
}

export const AddSessionDialog = ({
  isOpen,
  onOpenChange,
  title,
  onTitleChange,
  onAdd,
  selectedDate,
  category
}: AddSessionDialogProps) => {
  const { toast } = useToast();

  const handleAdd = async () => {
    try {
      // First call the original onAdd function
      onAdd();

      // Then send WhatsApp notification
      if (selectedDate && category) {
        const { error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            eventData: {
              type: 'TRAINING',
              date: format(selectedDate, "dd/MM/yyyy"),
              title: title,
              category: category
            }
          }
        });

        if (notificationError) {
          console.error('Error sending WhatsApp notification:', notificationError);
          toast({
            title: "Warning",
            description: "Training session created but there was an error sending notifications",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error handling training session creation:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Training Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>
          <Button onClick={handleAdd} className="w-full">
            Add Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};