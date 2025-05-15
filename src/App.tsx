
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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
import { Toaster } from "sonner";
import { NavBar } from "./components/NavBar";
import { ParentDashboard } from "./pages/ParentDashboard";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import { useAuth } from "./hooks/useAuth";
import { initializeUserRoles } from "./utils/database/setupUserRolesTable";

function App() {
  const { profile } = useAuth();
  
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
        });
    }
  }, [profile]);

  return (
    <TeamsContextProvider>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-slate-50">
        <ErrorBoundary>
          <NavBar />
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
