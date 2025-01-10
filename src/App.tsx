import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { Analytics } from "@/pages/Analytics";
import SquadManagement from "@/pages/SquadManagement";
import PlayerDetailsPage from "@/pages/PlayerDetailsPage";
import TopRatedByPosition from "@/pages/TopRatedByPosition";
import { Auth } from "@/pages/Auth";
import { Coaches } from "@/pages/Coaches";
import { Calendar } from "@/pages/Calendar";
import { NavBar } from "@/components/NavBar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session);
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_OUT') {
        toast({
          description: "Successfully signed out",
        });
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, [toast]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/auth" />
            }
          />
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <Auth />
            }
          />
          {isAuthenticated ? (
            <>
              <Route
                path="/home"
                element={
                  <>
                    <NavBar />
                    <Index />
                  </>
                }
              />
              <Route
                path="/analytics"
                element={
                  <>
                    <NavBar />
                    <Analytics />
                  </>
                }
              />
              <Route
                path="/squad"
                element={
                  <>
                    <NavBar />
                    <SquadManagement />
                  </>
                }
              />
              <Route
                path="/top-rated"
                element={
                  <>
                    <NavBar />
                    <TopRatedByPosition />
                  </>
                }
              />
              <Route
                path="/player/:id"
                element={
                  <>
                    <NavBar />
                    <PlayerDetailsPage />
                  </>
                }
              />
              <Route
                path="/coaches"
                element={
                  <>
                    <NavBar />
                    <Coaches />
                  </>
                }
              />
              <Route
                path="/calendar"
                element={
                  <>
                    <NavBar />
                    <Calendar />
                  </>
                }
              />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/auth" />} />
          )}
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;