
import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import FormationSelector from "./pages/FormationSelector";
import SquadManagement from "./pages/SquadManagement";
import PlayerDetailsPage from "./pages/PlayerDetailsPage";
import { Auth } from "./pages/Auth";
import { CalendarPage as Calendar } from "./pages/Calendar";
import TopRatedByPosition from "./pages/TopRatedByPosition";
import RoleSuitabilityPage from "./pages/RoleSuitabilityPage";
import Fixtures from "./pages/Fixtures";
import TeamSettings from "./pages/TeamSettings";
import { Analytics } from "./pages/Analytics";
import { Coaches } from "./pages/Coaches";
import ClubSettings from "./pages/ClubSettings";
import CreateClub from "./pages/CreateClub";
import { ParentDashboard } from "./pages/ParentDashboard";
import { PlatformLanding } from "./pages/PlatformLanding";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import CreateTeam from "./pages/CreateTeam";
import { AppLayout } from "./components/layout/AppLayout";
import { TeamDashboard } from "./pages/TeamDashboard";
import "./App.css";
import Index from "./pages/Index";

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Auth page is outside the layout since it doesn't need the NavBar */}
        <Route path="/login" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />

        {/* All other routes use the layout with NavBar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<TeamDashboard />} />
          <Route path="/squad" element={<Navigate to="/squad-management" replace />} />
          <Route path="/squad-management" element={<SquadManagement />} />
          <Route path="/player/:id" element={<PlayerDetailsPage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/top-rated-by-position" element={<TopRatedByPosition />} />
          <Route path="/role-suitability/:playerId" element={<RoleSuitabilityPage />} />
          <Route path="/formation-selector" element={<FormationSelector />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/team-settings" element={<TeamSettings />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/club-settings" element={<ClubSettings />} />
          <Route path="/create-club" element={<CreateClub />} />
          <Route path="/parent-dashboard" element={<ParentDashboard />} />
          <Route path="/platform" element={<PlatformLanding />} />
          <Route path="/player-dashboard" element={<PlayerDashboard />} />
          <Route path="/create-team" element={<CreateTeam />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
