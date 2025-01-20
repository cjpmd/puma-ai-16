import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { NavBar } from "@/components/NavBar";
import { SquadManagement } from "@/pages/SquadManagement";
import { Calendar } from "@/pages/Calendar";
import { Fixtures } from "@/pages/Fixtures";
import { Analytics } from "@/pages/Analytics";
import { Coaches } from "@/pages/Coaches";
import PlayerDetailsPage from "@/pages/PlayerDetailsPage";
import { PrivacyPolicy } from "@/pages/PrivacyPolicy";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-4">
          <NavBar />
          <Routes>
            <Route path="/" element={<SquadManagement />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/fixtures" element={<Fixtures />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/coaches" element={<Coaches />} />
            <Route path="/player/:id" element={<PlayerDetailsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;