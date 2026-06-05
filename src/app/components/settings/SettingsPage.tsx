import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Lock, Wifi, Info, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase, useStore } from "../../store";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import logoImg from "../../../imports/F999502A-0064-4725-8E95-818128824C63_L0_001-4_2_2026__6_30_13_PM.png";

export default function SettingsPage() {
  const user = useStore((s) => s.user);
  const syncStatus = useStore((s) => s.syncStatus);
  const [tab, setTab] = useState<"profile" | "password" | "sync" | "about">("profile");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      full_name: user?.user_metadata?.full_name ?? "",
      email: user?.email ?? "",
    }
  });

  const passwordForm = useForm<{ current_password: string; new_password: string; confirm_password: string }>();

  const updateProfile = async (data: any) => {
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      const { error: err } = await supabase.auth.updateUser({ data: { full_name: data.full_name } });
      if (err) throw err;
      setSuccess("Profile updated successfully!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updatePassword = async (data: any) => {
    if (data.new_password !== data.confirm_password) { setError("Passwords do not match"); return; }
    setSubmitting(true); setError(null); setSuccess(null);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: data.new_password });
      if (err) throw err;
      setSuccess("Password updated successfully!");
      passwordForm.reset();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { key: "profile" as const, label: "Profile", icon: User },
    { key: "password" as const, label: "Password", icon: Lock },
    { key: "sync" as const, label: "Sync", icon: Wifi },
    { key: "about" as const, label: "About", icon: Info },
  ];

  const initials = (user?.user_metadata?.full_name ?? user?.email ?? "?")
    .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
      </div>

      {/* Avatar + Name */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-pink-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-bold text-gray-800 text-lg">{user?.user_metadata?.full_name ?? "User"}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSuccess(null); setError(null); }}
            className={`flex items-center gap-2 flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
              tab === key ? "bg-pink-500 text-white" : "bg-white border border-pink-200 text-gray-600 hover:bg-pink-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
      )}

      {/* Profile Tab */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
          <h2 className="font-bold text-gray-800 mb-4">Edit Profile</h2>
          <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                {...profileForm.register("full_name")}
                className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[48px]"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                {...profileForm.register("email")}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 min-h-[48px] cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-xl hover:from-pink-500 hover:to-pink-600 disabled:opacity-60 min-h-[48px]">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {tab === "password" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
          <h2 className="font-bold text-gray-800 mb-4">Change Password</h2>
          <form onSubmit={passwordForm.handleSubmit(updatePassword)} className="space-y-4">
            {[
              { name: "new_password" as const, label: "New Password", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
              { name: "confirm_password" as const, label: "Confirm New Password", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
            ].map(({ name, label, show, toggle }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <input
                    {...passwordForm.register(name, { required: true, minLength: { value: 8, message: "Min 8 chars" } })}
                    type={show ? "text" : "password"}
                    className="w-full px-4 pr-12 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 min-h-[48px]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-xl hover:from-pink-500 hover:to-pink-600 disabled:opacity-60 min-h-[48px]">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Sync Tab */}
      {tab === "sync" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 space-y-4">
          <h2 className="font-bold text-gray-800 mb-2">Data Sync</h2>
          <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
            <div className={`w-3 h-3 rounded-full ${syncStatus === "online" || syncStatus === "synced" ? "bg-green-500" : syncStatus === "syncing" ? "bg-yellow-500" : "bg-red-500"}`} />
            <div>
              <p className="font-medium text-gray-800 capitalize">Status: {syncStatus}</p>
              <p className="text-xs text-gray-500">Data syncs automatically when online</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>✅ Products are synced in real-time</p>
            <p>✅ Sales transactions are backed up</p>
            <p>✅ All data stored securely on Supabase</p>
          </div>
        </div>
      )}

      {/* About Tab */}
      {tab === "about" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50 space-y-4">
          <div className="text-center">
            <ImageWithFallback src={logoImg} alt="Lemon & Lace logo" className="w-24 h-24 object-cover rounded-full mx-auto mb-1" />
            <h2 className="text-xl font-bold text-gray-800">Lemon & Lace</h2>
            <p className="text-pink-500 font-medium">Inventory & Sales System</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between py-2 border-b border-pink-50">
              <span>Version</span><span className="font-semibold text-gray-800">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-pink-50">
              <span>Built with</span><span className="font-semibold text-gray-800">React + Supabase</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Business</span><span className="font-semibold text-gray-800">Lemon & Lace Snacks</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
