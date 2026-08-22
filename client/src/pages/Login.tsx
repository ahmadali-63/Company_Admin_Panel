import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await login({ email, password });

      if (res.success && res.user) {
        const from = (location.state as any)?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else if (res.user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (res.user.role === "hr") {
          navigate("/hr/dashboard", { replace: true });
        } else {
          navigate("/employee/dashboard", { replace: true });
        }
      } else {
        setError(res.message || "Invalid login credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/25 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Company Management Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Sign in to access your administrative dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          {/* Demo Credentials Quick Switcher */}
          <div className="mb-6 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
              ⚡ Quick Demo Autofill
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => autofill("admin@company.com", "Admin@12345")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-indigo-950 hover:border-indigo-500/50 border border-slate-700/80 text-white transition-all group"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-semibold">Admin</span>
                <span className="text-[9px] text-slate-400">Owner</span>
              </button>

              <button
                type="button"
                onClick={() => autofill("sarah.hr@company.com", "Admin@12345")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-purple-950 hover:border-purple-500/50 border border-slate-700/80 text-white transition-all group"
              >
                <UserCheck className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-semibold">HR Lead</span>
                <span className="text-[9px] text-slate-400">Sarah</span>
              </button>

              <button
                type="button"
                onClick={() => autofill("ahmad.ali@company.com", "Admin@12345")}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 hover:bg-blue-950 hover:border-blue-500/50 border border-slate-700/80 text-white transition-all group"
              >
                <Briefcase className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[11px] font-semibold">Employee</span>
                <span className="text-[9px] text-slate-400">Ahmad</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300"
              >
                Work Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300"
              >
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In to Portal"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Internal Enterprise System. Unauthorized access is strictly logged and audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
