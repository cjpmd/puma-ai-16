import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "./pages/Auth";
import Index from "./pages/Index";
import SquadManagement from "./pages/SquadManagement";
import { Analytics } from "./pages/Analytics";
import TopRatedByPosition from "./pages/TopRatedByPosition";
import FormationSelector from "./pages/FormationSelector";
import { Calendar as CalendarComponent } from "./hooks/calendar";
import PlayerDetailsPage from "./pages/PlayerDetailsPage";
import RoleSuitabilityPage from "./pages/RoleSuitabilityPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Fixtures from "./pages/Fixtures";
import { TeamsContextProvider } from "@/contexts/TeamContext";
import CreateTeam from "./pages/CreateTeam";
import TeamSettings from "./pages/TeamSettings";
import ClubDashboard from "./pages/ClubDashboard";
import ClubSettings from "./pages/ClubSettings";
import { PlatformLanding } from "./pages/PlatformLanding";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "@/hooks/use-toast";
import { NavBar } from "./components/NavBar";
import { ParentDashboard } from "./pages/ParentDashboard";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import { useAuth } from "./hooks/useAuth";
import { initializeUserRoles } from "./utils/database/setupUserRolesTable";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ensureDatabaseSetup } from "./utils/database/ensureDatabaseSetup";
import { Button } from "@/components/ui/button";
import { initializeDatabase, createParentChildLinkingColumns } from "./utils/database/initializeDatabase";

function App() {
  const { profile } = useAuth();
  const [dbSetupError, setDbSetupError] = useState(false);
  const [isCheckingDb, setIsCheckingDb] = useState(true);
  const [isInitializingDb, setIsInitializingDb] = useState(false);
  
  // Attempt database setup once on initial load with a timeout
  useEffect(() => {
    const checkDatabaseSetup = async () => {
      setIsCheckingDb(true);
      
      // Set a timeout for the database check
      const timeoutId = setTimeout(() => {
        console.warn("Database setup check timed out");
        setDbSetupError(true);
        setIsCheckingDb(false);
      }, 8000); // 8 seconds timeout
      
      try {
        const setupResult = await ensureDatabaseSetup();
        clearTimeout(timeoutId); // Clear timeout if we get a response
        
        if (!setupResult) {
          console.warn("Database setup check failed");
          setDbSetupError(true);
        } else {
          setDbSetupError(false);
        }
      } catch (error) {
        console.error("Error checking database setup:", error);
        setDbSetupError(true);
      } finally {
        setIsCheckingDb(false);
        clearTimeout(timeoutId); // Ensure timeout is cleared
      }
    };
    
    checkDatabaseSetup();
  }, []);
  
  // Initialize user roles system when profile loads
  useEffect(() => {
    if (profile?.id && profile?.role) {
      initializeUserRoles(profile.id, profile.role)
        .then(success => {
          if (success) {
            console.log("User roles system initialized successfully");
          } else {
            console.error("Failed to initialize user roles system");
          }
        })
        .catch(error => {
          console.error("Error initializing user roles system:", error);
        });
    }
  }, [profile]);

  // Function to manually initialize database
  const handleManualDbInit = async () => {
    setIsInitializingDb(true);
    try {
      // First try to initialize the database
      const result = await initializeDatabase();
      
      // Then specifically try to create parent-child linking columns
      const linkingResult = await createParentChildLinkingColumns();
      
      if (result && linkingResult) {
        setDbSetupError(false);
        toast({
          title: "Database Initialized",
          description: "Database tables have been created successfully"
        });
      } else {
        toast({
          title: "Database initialization partially failed",
          description: "Some tables or columns could not be created",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in manual database initialization:", error);
    } finally {
      setIsInitializingDb(false);
    }
  };

  return (
    <TeamsContextProvider>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-slate-50">
        <ErrorBoundary>
          <NavBar />
          
          {dbSetupError && (
            <Alert variant="destructive" className="max-w-4xl mx-auto mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Database Configuration</AlertTitle>
              <AlertDescription className="flex flex-col gap-4">
                <p>
                  Some database tables may be missing. This won't prevent you from using the application,
                  but some features might not work correctly.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManualDbInit}
                    disabled={isInitializingDb}
                  >
                    {isInitializingDb ? "Initializing..." : "Initialize Database"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => createParentChildLinkingColumns()}
                    disabled={isInitializingDb}
                  >
                    Fix Parent Linking
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {isCheckingDb && (
            <div className="max-w-4xl mx-auto mt-4 p-4 bg-amber-50 border border-amber-100 rounded-md">
              <div className="flex items-center space-x-2 text-amber-700">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Checking database configuration...</p>
              </div>
            </div>
          )}
          
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/player/:id" element={<ProtectedRoute><PlayerDetailsPage /></ProtectedRoute>} />
            <Route path="/squad" element={<ProtectedRoute><SquadManagement /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/top-rated" element={<ProtectedRoute><TopRatedByPosition /></ProtectedRoute>} />
            <Route path="/role-suitability/:playerId" element={<ProtectedRoute><RoleSuitabilityPage /></ProtectedRoute>} />
            <Route path="/formation" element={<ProtectedRoute><FormationSelector /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarComponent /></ProtectedRoute>} />
            <Route path="/fixtures" element={<ProtectedRoute><Fixtures /></ProtectedRoute>} />
            <Route path="/platform" element={<ProtectedRoute><PlatformLanding /></ProtectedRoute>} />
            <Route path="/create-team" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
            <Route path="/team-settings" element={<ProtectedRoute><TeamSettings /></ProtectedRoute>} />
            <Route path="/club/:clubId" element={<ProtectedRoute><ClubDashboard /></ProtectedRoute>} />
            <Route path="/club-settings" element={<ProtectedRoute><ClubSettings /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><TeamSettings /></ProtectedRoute>} />
            <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/player-dashboard" element={<ProtectedRoute allowedRoles={['player']}><PlayerDashboard /></ProtectedRoute>} />
          </Routes>
        </ErrorBoundary>
      </div>
    </TeamsContextProvider>
  );
}

export default App;
