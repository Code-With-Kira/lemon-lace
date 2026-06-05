import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { supabase, useStore } from "../../store";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import logoImg from "../../../imports/F999502A-0064-4725-8E95-818128824C63_L0_001-4_2_2026__6_30_13_PM.png";

type AuthMode = "login" | "register" | "forgot";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const setSession = useStore((s) => s.setSession);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<{
    email: string; password: string; confirm_password: string; full_name: string;
  }>();

  const password = watch("password");

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setMessage(null);
    try {
      if (mode === "login") {
        const { data: auth, error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
        if (error) throw error;
        setSession(auth.session);
      } else if (mode === "register") {
        const { data: auth, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { data: { full_name: data.full_name } },
        });
        if (error) throw error;
        // If session is returned, email confirm is disabled — log in immediately
        if (auth.session) {
          setSession(auth.session);
        } else {
          setMessage({ type: "success", text: "Account created! Check your email to confirm, then sign in." });
          reset();
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage({ type: "success", text: "Password reset email sent! Check your inbox." });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message ?? "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength = passwordStrength(watch("password") ?? "");
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"][strength];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <ImageWithFallback
            src={logoImg}
            alt="Lemon & Lace Snacks and Drinks logo"
            className="w-32 h-32 object-cover rounded-full mx-auto drop-shadow-lg"
          />
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {mode === "login" ? "Welcome Back!" : mode === "register" ? "Create Account" : "Reset Password"}
          </h2>

          {message && (
            <div className={`mb-4 p-4 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    {...register("full_name", { required: "Full name is required" })}
                    className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[48px]"
                    placeholder="Your full name"
                  />
                </div>
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                <input
                  {...register("email", { required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[48px]"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "At least 8 characters" }
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[48px]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                {mode === "register" && watch("password") && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">Password strength: <span className="font-medium">{strengthLabel}</span></p>
                  </div>
                )}
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
                  <input
                    {...register("confirm_password", {
                      required: "Please confirm your password",
                      validate: (v) => v === password || "Passwords do not match"
                    })}
                    type={showConfirm ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-800 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 min-h-[48px]"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
              </div>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => { setMode("forgot"); setMessage(null); }} className="text-sm text-pink-500 hover:text-pink-700 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-pink-400 to-pink-500 text-white font-bold rounded-xl hover:from-pink-500 hover:to-pink-600 transition-all shadow-md disabled:opacity-60 min-h-[48px] flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Email"}
            </button>
          </form>

          {/* Mode switch */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("register"); setMessage(null); }} className="text-pink-500 font-semibold hover:text-pink-700">Sign Up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setMessage(null); }} className="text-pink-500 font-semibold hover:text-pink-700">Sign In</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
