import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex space-x-4 mb-4 border-b pb-2">
      <Link
        to="/"
        className={cn(
          "hover:text-primary transition-colors",
          isActive("/") && "text-primary font-medium"
        )}
      >
        Squad
      </Link>
      <Link
        to="/calendar"
        className={cn(
          "hover:text-primary transition-colors",
          isActive("/calendar") && "text-primary font-medium"
        )}
      >
        Calendar
      </Link>
      <Link
        to="/fixtures"
        className={cn(
          "hover:text-primary transition-colors",
          isActive("/fixtures") && "text-primary font-medium"
        )}
      >
        Fixtures
      </Link>
      <Link
        to="/analytics"
        className={cn(
          "hover:text-primary transition-colors",
          isActive("/analytics") && "text-primary font-medium"
        )}
      >
        Analytics
      </Link>
      <Link
        to="/coaches"
        className={cn(
          "hover:text-primary transition-colors",
          isActive("/coaches") && "text-primary font-medium"
        )}
      >
        Coaches
      </Link>
      <div className="flex-1"></div>
      <Link
        to="/privacy-policy"
        className={cn(
          "hover:text-primary transition-colors text-sm text-muted-foreground",
          isActive("/privacy-policy") && "text-primary font-medium"
        )}
      >
        Privacy Policy
      </Link>
    </nav>
  );
};