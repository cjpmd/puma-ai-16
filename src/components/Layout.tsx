import { NavBar } from "./NavBar";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="pt-16">{children}</main>
    </div>
  );
};