import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { Analytics } from "@/pages/Analytics";
import SquadManagement from "@/pages/SquadManagement";
import { Auth } from "@/pages/Auth";
import { Coaches } from "@/pages/Coaches";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/squad" element={<SquadManagement />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/coaches" element={<Coaches />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;