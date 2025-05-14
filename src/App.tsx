
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Squad from "./pages/SquadManagement";
import { CalendarPage } from "./pages/Calendar";
import Fixtures from "./pages/Fixtures";
import { Analytics } from "./pages/Analytics";
import PlayerDetails from "./pages/PlayerDetailsPage";
import FormationSelector from "./pages/FormationSelector";
import RoleSuitability from "./pages/RoleSuitabilityPage";
import TopRatedByPosition from "./pages/TopRatedByPosition";
import TeamSettings from "./pages/TeamSettings";
import ClubSettings from "./pages/ClubSettings";
import ClubDashboard from "./pages/ClubDashboard";
import CreateTeam from "./pages/CreateTeam";
import PlatformLanding from "./pages/PlatformLanding";
import { ParentDashboard } from "./pages/ParentDashboard";
import { Auth } from "./pages/Auth";
import { Coaches } from "./pages/Coaches";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NavBar />
        <Routes>
          {/* Public routes - accessible without login */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create-team" element={<CreateTeam />} />
          <Route path="/club-settings" element={<ClubSettings />} />
          
          {/* Platform Routes */}
          <Route
            path="/platform"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach', 'parent']}>
                <PlatformLanding />
              </ProtectedRoute>
            }
          />
          
          {/* Parent Routes */}
          <Route
            path="/parent-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'parent', 'coach']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin and Manager Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach', 'parent']}>
                <Index />
              </ProtectedRoute>
            } 
          />
          
          {/* Club Routes */}
          <Route
            path="/club/:clubId"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <ClubDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin and Manager Only Routes */}
          <Route 
            path="/squad" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Squad />
              </ProtectedRoute>
            } 
          />
          
          {/* Shared Routes with Different Views */}
          <Route 
            path="/calendar" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach', 'parent']}>
                <CalendarPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/fixtures" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach']}>
                <Fixtures />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach']}>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/player/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach', 'parent']}>
                <PlayerDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Only Routes */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <TeamSettings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/coaches" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Coaches />
              </ProtectedRoute>
            } 
          />
          
          {/* Technical Routes */}
          <Route 
            path="/formation" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <FormationSelector />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/role-suitability" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach']}>
                <RoleSuitability />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/top-rated" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach']}>
                <TopRatedByPosition />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
