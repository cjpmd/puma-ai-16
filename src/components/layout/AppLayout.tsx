
import { NavBar } from "@/components/NavBar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
