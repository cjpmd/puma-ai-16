import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlayerHeaderProps {
  name: string;
  squadNumber?: number;
  category?: string;
}

export const PlayerHeader = ({ name, squadNumber, category }: PlayerHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/squad')}
        className="hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h2 className="text-2xl font-bold">
        {name} {squadNumber && `#${squadNumber}`} {category && `(${category})`}
      </h2>
    </div>
  );
};