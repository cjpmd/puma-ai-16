import { Button } from "@/components/ui/button";
import { Plus, Trophy, Handshake, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddEventMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddFixture: () => void;
  onAddFriendly: () => void;
  onAddTournament: () => void;
  onAddFestival: () => void;
}

export const AddEventMenu = ({
  isOpen,
  onOpenChange,
  onAddFixture,
  onAddFriendly,
  onAddTournament,
  onAddFestival
}: AddEventMenuProps) => {
  return (
    <div className="relative">
      <Button
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300",
          isOpen && "rotate-45"
        )}
        onClick={() => onOpenChange(!isOpen)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <div className={cn(
        "absolute right-0 mt-2 space-y-2 transition-all duration-300",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full justify-start bg-white hover:bg-primary/5"
          onClick={() => {
            onAddFixture();
            onOpenChange(false);
          }}
        >
          <Trophy className="h-4 w-4" />
          Add Fixture
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full justify-start bg-white hover:bg-primary/5"
          onClick={() => {
            onAddFriendly();
            onOpenChange(false);
          }}
        >
          <Handshake className="h-4 w-4" />
          Add Friendly
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full justify-start bg-white hover:bg-primary/5"
          onClick={() => {
            onAddTournament();
            onOpenChange(false);
          }}
        >
          <Trophy className="h-4 w-4" />
          Add Tournament
        </Button>
        <Button
          variant="outline"
          className="flex items-center gap-2 w-full justify-start bg-white hover:bg-primary/5"
          onClick={() => {
            onAddFestival();
            onOpenChange(false);
          }}
        >
          <Users className="h-4 w-4" />
          Add Festival
        </Button>
      </div>
    </div>
  );
};