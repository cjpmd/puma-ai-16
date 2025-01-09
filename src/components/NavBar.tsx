import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Users, BarChart2, UserCircle } from "lucide-react";

export const NavBar = () => {
  return (
    <div className="w-full bg-white shadow-sm mb-8">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png" 
            alt="Broughty United Pumas Logo" 
            className="h-12 w-auto"
          />
        </div>
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link to="/squad">
            <Button variant="ghost">
              <Users className="mr-2 h-4 w-4" />
              Squad
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="ghost">
              <BarChart2 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link to="/coaches">
            <Button variant="ghost">
              <UserCircle className="mr-2 h-4 w-4" />
              Coaches
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};