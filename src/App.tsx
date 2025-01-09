import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { Analytics } from "@/pages/Analytics";
import SquadManagement from "@/pages/SquadManagement";
import { Auth } from "@/pages/Auth";
import { Coaches } from "@/pages/Coaches";
import { NavBar } from "@/components/NavBar";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
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
            path="/coaches"
            element={
              <>
                <NavBar />
                <Coaches />
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