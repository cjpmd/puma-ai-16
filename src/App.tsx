
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Auth } from "./pages/Auth";
import { AppLayout } from "./components/layout/AppLayout";
import { TeamDashboard } from "./pages/TeamDashboard";
import { Analytics } from "./pages/Analytics";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import { ParentDashboard } from "./pages/ParentDashboard";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { PlatformLanding } from "./pages/PlatformLanding";
import SquadManagement from "./pages/SquadManagement";
import TeamSettings from "./pages/TeamSettings";
import { Calendar } from "./pages/Calendar";

export function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <Routes>
      <Route
        path="/auth"
        element={session ? <Navigate to="/platform" /> : <Auth />}
      />
      <Route element={<AppLayout />}>
        <Route
          path="/platform"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <PlatformLanding />
            )
          }
        />
        <Route
          path="/team-dashboard"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <TeamDashboard />
            )
          }
        />
        <Route
          path="/analytics"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <Analytics />
            )
          }
        />
        <Route
          path="/player-dashboard"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <PlayerDashboard />
            )
          }
        />
        <Route
          path="/parent-dashboard"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <ParentDashboard />
            )
          }
        />
        <Route
          path="/squad-management"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <SquadManagement />
            )
          }
        />
        <Route
          path="/calendar"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <Calendar />
            )
          }
        />
        <Route
          path="/player/:id"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <div>player</div>
            )
          }
        />
        <Route
          path="/account"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <div>account</div>
            )
          }
        />
        <Route
          path="/subscription"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <SubscriptionPage />
            )
          }
        />
        <Route
          path="/team-settings"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <TeamSettings />
            )
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/platform" />} />
    </Routes>
  );
}
