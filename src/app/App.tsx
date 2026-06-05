import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { supabase, useStore } from "./store";
import AuthPage from "./components/auth/AuthPage";
import Layout from "./components/layout/Layout";
import DashboardPage from "./components/dashboard/DashboardPage";
import InventoryPage from "./components/inventory/InventoryPage";
import SalesPage from "./components/sales/SalesPage";
import NewSalePage from "./components/sales/NewSalePage";
import ReportsPage from "./components/reports/ReportsPage";
import SettingsPage from "./components/settings/SettingsPage";

function ProtectedLayout() {
  const session = useStore((s) => s.session);
  if (!session) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<NewSalePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  const session = useStore((s) => s.session);
  const setSession = useStore((s) => s.setSession);

  useEffect(() => {
    // Restore session on load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
