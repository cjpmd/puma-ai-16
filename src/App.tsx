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
import { Auth } from "./pages/Auth";
import { Coaches } from "./pages/Coaches";
import { NavBar } from "./components/NavBar";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/player/:id" element={<PlayerDetails />} />
          <Route path="/formation" element={<FormationSelector />} />
          <Route path="/role-suitability" element={<RoleSuitability />} />
          <Route path="/top-rated" element={<TopRatedByPosition />} />
          <Route path="/settings" element={<TeamSettings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;