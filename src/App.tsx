import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { Analytics } from "@/pages/Analytics";
import SquadManagement from "@/pages/SquadManagement";
import PlayerDetailsPage from "@/pages/PlayerDetailsPage";
import { Auth } from "@/pages/Auth";
import { Coaches } from "@/pages/Coaches";
import { Calendar } from "@/pages/Calendar";
import { NavBar } from "@/components/NavBar";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<Auth />} />
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
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;