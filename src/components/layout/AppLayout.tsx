
import { NavBar } from "@/components/NavBar";
import { Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const location = useLocation();
  
  // Only hide NavBar on auth pages - all other pages should show it
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login';
  
  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <NavBar />}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
