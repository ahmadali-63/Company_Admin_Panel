import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid credentials.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Dynamic background glow shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl glass-panel bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 relative z-10">
        {/* Left Side Visual Hero Banner */}
        <div className="md:col-span-5 p-8 md:p-10 bg-gradient-to-br from-indigo-900/40 via-slate-900 to-purple-900/40 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                Nexus<span className="text-indigo-400">Admin</span>
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white leading-tight">
                Enterprise <span className="text-gradient">Admin Panel</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Empowering teams with seamless role hierarchy, real-time analytics, and automated project workflows.
              </p>
            </div>

            {/* Micro Stats Preview */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">System Uptime</p>
                  <p className="text-xs font-bold text-slate-200">99.9% Operational</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Security Standard</p>
                  <p className="text-xs font-bold text-slate-200">JWT & Role Enforced</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Need an account?{" "}
              <Link to="/register" className="text-indigo-400 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-7 p-8 md:p-10 space-y-6 flex flex-col justify-center">
          <div>
            <h2 className="text-xl font-extrabold text-white">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your portal</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 group mt-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
