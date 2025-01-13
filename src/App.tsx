import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import Index from "./pages/Index";
import SquadManagement from "./pages/SquadManagement";
import PlayerDetailsPage from "./pages/PlayerDetailsPage";
import { Calendar } from "./pages/Calendar";
import { Analytics } from "./pages/Analytics";
import Fixtures from "./pages/Fixtures";
import TopRatedByPosition from "./pages/TopRatedByPosition";
import FormationSelector from "./pages/FormationSelector";
import RoleSuitabilityPage from "./pages/RoleSuitabilityPage";
import TeamSettings from "./pages/TeamSettings";
import { Coaches } from "./pages/Coaches";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <NavBar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/squad" element={<SquadManagement />} />
          <Route path="/player/:id" element={<PlayerDetailsPage />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/top-rated" element={<TopRatedByPosition />} />
          <Route path="/formation" element={<FormationSelector />} />
          <Route path="/role-suitability" element={<RoleSuitabilityPage />} />
          <Route path="/settings" element={<TeamSettings />} />
          <Route path="/coaches" element={<Coaches />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;