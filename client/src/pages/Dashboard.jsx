import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import StatCard from "../components/ui/StatCard";
import { CardSkeleton } from "../components/ui/LoadingSkeleton";
import { RoleBadge } from "../components/ui/Badge";
import {
  Users,
  UserCheck,
  UserCog,
  UserCheck2,
  FolderKanban,
  CheckSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#ef4444"];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await API.get("/stats");
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-slate-900/60 rounded-2xl animate-pulse"></div>
        <CardSkeleton count={4} />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const { stats, charts, recentActivity } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-400 tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <RoleBadge role={user?.role} />
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Here's an overview of your organization's projects, workforce, and task progress.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Last sync: Just now</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Primary Statistics Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
          Core System Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees}
            icon={Users}
            color="indigo"
            subtitle="Across all departments"
          />
          <StatCard
            title="Total HR Managers"
            value={stats?.totalHRs}
            icon={UserCheck}
            color="blue"
            subtitle="HR Supervisors"
          />
          <StatCard
            title="Total Team Leads"
            value={stats?.totalTeamLeads}
            icon={UserCog}
            color="emerald"
            subtitle="Project Leads"
          />
          <StatCard
            title="Team Members"
            value={stats?.totalTeamMembers}
            icon={UserCheck2}
            color="purple"
            subtitle="Active Workforce"
          />
        </div>
      </div>

      {/* Secondary Project & Task Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects}
          icon={FolderKanban}
          color="indigo"
        />
        <StatCard
          title="Active Projects"
          value={stats?.activeProjects}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Completed Projects"
          value={stats?.completedProjects}
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks}
          icon={CheckSquare}
          color="emerald"
          subtitle={`Out of ${stats?.totalTasks || 0} total tasks`}
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Employees by Role */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-1">Workforce Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Employees categorized by operational role</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.employeesByRole || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.employeesByRole || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                  <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#bfdbfe",
                    borderRadius: "12px",
                    color: "#1d4ed8",
                  }}
                  itemStyle={{ color: "#1d4ed8", fontWeight: 700 }}
                  labelStyle={{ color: "#1d4ed8", fontWeight: 700 }}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Projects by Status */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <h3 className="text-base font-bold text-slate-100 mb-1">Projects by Status</h3>
          <p className="text-xs text-slate-400 mb-4">Current lifecycle distribution of company projects</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.projectsByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#bfdbfe",
                    borderRadius: "12px",
                    color: "#1d4ed8",
                  }}
                  itemStyle={{ color: "#1d4ed8", fontWeight: 700 }}
                  labelStyle={{ color: "#1d4ed8", fontWeight: 700 }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Recent Activity Feed
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time log of company changes and task updates</p>
          </div>
        </div>

        {recentActivity && recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      act.type === "user"
                        ? "bg-purple-400"
                        : act.type === "project"
                        ? "bg-indigo-400"
                        : "bg-emerald-400"
                    }`}
                  ></div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{act.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-500 shrink-0">
                  {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
