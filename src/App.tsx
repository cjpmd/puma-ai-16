
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import { Auth } from "./pages/Auth";
import { Coaches } from "./pages/Coaches";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Admin and Manager Routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager', 'coach', 'parent']}>
                <Index />
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
