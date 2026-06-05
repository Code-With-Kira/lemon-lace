import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut,
  Menu, X, ChevronLeft, ChevronRight, Wifi, WifiOff, Plus
} from "lucide-react";
import { supabase, useStore } from "../../store";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import logoImg from "../../../imports/F999502A-0064-4725-8E95-818128824C63_L0_001-4_2_2026__6_30_13_PM.png";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/inventory", icon: Package, label: "Inventory" },
  { to: "/sales", icon: ShoppingCart, label: "Sales" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const syncStatus = useStore((s) => s.syncStatus);
  const user = useStore((s) => s.user);
  const setSession = useStore((s) => s.setSession);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  const statusColors: Record<string, string> = {
    online: "text-green-500", offline: "text-red-500", syncing: "text-yellow-500",
    synced: "text-green-500", error: "text-red-500",
  };

  return (
    <div className="min-h-screen bg-pink-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-pink-100 shadow-sm transition-all duration-300 ${sidebarOpen ? "w-64" : "w-16"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-100">
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <ImageWithFallback src={logoImg} alt="Lemon & Lace logo" className="w-10 h-10 object-cover rounded-full flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-bold text-gray-800 text-sm leading-tight truncate">Lemon & Lace</p>
                <p className="text-xs text-pink-400 truncate">Snacks & Drinks</p>
              </div>
            </div>
          )}
          {!sidebarOpen && <ImageWithFallback src={logoImg} alt="Lemon & Lace logo" className="w-9 h-9 object-cover rounded-full mx-auto" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto p-1.5 rounded-lg hover:bg-pink-50 text-gray-400">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all min-h-[44px] ${
                  isActive
                    ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md"
                    : "text-gray-600 hover:bg-pink-50 hover:text-pink-600"
                } ${!sidebarOpen ? "justify-center" : ""}`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-pink-100 space-y-1">
          {sidebarOpen && (
            <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-500">
              {syncStatus === "offline" ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              <span className={statusColors[syncStatus]}>{syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}</span>
            </div>
          )}
          {sidebarOpen && user && (
            <div className="px-3 py-2 text-xs text-gray-500 truncate">
              {user.user_metadata?.full_name ?? user.email}
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all min-h-[44px] ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <ImageWithFallback src={logoImg} alt="Lemon & Lace logo" className="w-10 h-10 object-cover rounded-full" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">Lemon & Lace</p>
                  <p className="text-xs text-pink-400">Snacks & Drinks</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-pink-50">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="flex-1 p-2 space-y-1">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[48px] ${
                      isActive ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white" : "text-gray-600 hover:bg-pink-50"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </nav>
            {user && (
              <div className="p-4 border-t border-pink-100 text-sm text-gray-600">
                {user.user_metadata?.full_name ?? user.email}
              </div>
            )}
            <div className="p-2 border-t border-pink-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 min-h-[48px]">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-pink-100 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl hover:bg-pink-50">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <ImageWithFallback src={logoImg} alt="Lemon & Lace logo" className="w-8 h-8 object-cover rounded-full" />
            <span className="font-bold text-gray-800 text-sm">Lemon & Lace</span>
          </div>
          <NavLink to="/sales/new" className="p-2 rounded-xl bg-pink-500 text-white">
            <Plus className="w-4 h-4" />
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 z-30 safe-area-bottom">
          <div className="flex items-center justify-around px-2 py-1">
            {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[56px] min-h-[52px] justify-center ${
                    isActive ? "text-pink-500" : "text-gray-400"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
