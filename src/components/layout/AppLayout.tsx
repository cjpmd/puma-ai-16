
import { NavBar } from "@/components/NavBar";
import { Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const location = useLocation();
  
  // Only hide NavBar on auth pages - all other pages should show it
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/login';
  
  return (
    <>
      {!isAuthPage && <NavBar />}
      <Outlet />
    </>
  );
}
