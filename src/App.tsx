import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Auth } from "./components/Auth";
import { Coaches } from "./pages/Coaches";
import SquadManagement from "./pages/SquadManagement";
import { Analytics } from "./pages/Analytics";
import { Calendar } from "./pages/Calendar";
import { Settings } from "./pages/Settings";
import { Dashboard } from "./pages/Dashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<Dashboard />} />
                    <Route path="/squad" element={<SquadManagement />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/coaches" element={<Coaches />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;