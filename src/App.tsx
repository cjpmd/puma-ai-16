
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { Auth } from "./pages/Auth";
import { AppLayout } from "./components/layout/AppLayout";
import { TeamDashboard } from "./pages/TeamDashboard";
import Analytics from "./pages/Analytics";
import { PlayerDashboard } from "./pages/PlayerDashboard";
import { ParentDashboard } from "./pages/ParentDashboard";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { PlatformLanding } from "./pages/PlatformLanding";
import SquadManagement from "./pages/SquadManagement";
import { TeamSettings } from "./pages/TeamSettings";
import CalendarPage from "./components/calendar/CalendarPage";
import GlobalAdminDashboard from "./pages/GlobalAdminDashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import PlayerDetailsPage from "./pages/PlayerDetailsPage";
import { ensureDatabaseSetup } from "./utils/database/ensureDatabaseSetup";

export function App() {
  const [session, setSession] = useState(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    // Initialize database setup
    const initDb = async () => {
      try {
        const result = await ensureDatabaseSetup();
        setDbInitialized(result);
        console.log("Database initialization completed with result:", result);
      } catch (error) {
        console.error("Database initialization error:", error);
        setDbInitialized(true); // Still allow the app to proceed
      }
    };

    initDb();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log('Session loaded:', session ? 'Active' : 'None');
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Active' : 'None');
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
          path="/global-admin"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <GlobalAdminDashboard />
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
              <CalendarPage />
            )
          }
        />
        <Route
          path="/player/:id"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <PlayerDetailsPage />
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
        <Route
          path="/club-settings"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Club Settings</h1>
                <p>Club management functionality will be available soon.</p>
              </div>
            )
          }
        />
        <Route
          path="/club-dashboard"
          element={
            !session ? (
              <Navigate to="/auth" />
            ) : (
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">Club Dashboard</h1>
                <p>Club dashboard functionality will be available soon.</p>
              </div>
            )
          }
        />
        <Route
          path="/"
          element={<Navigate to={session ? "/platform" : "/auth"} />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/platform" />} />
    </Routes>
  );
}
