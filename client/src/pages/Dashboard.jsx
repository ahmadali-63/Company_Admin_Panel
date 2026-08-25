import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  ArrowRight,
  PlusCircle,
  Sparkles,
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

const CHART_COLORS = [
  "#845EC2",
  "#2C73D2",
  "#0081CF",
  "#0089BA",
  "#008E9B",
  "#008F7A",
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3.5 rounded-2xl bg-slate-950/95 border border-[#0081CF]/40 shadow-2xl text-xs">
        <p className="font-bold text-white mb-1">{label || payload[0].name}</p>
        <p className="font-extrabold text-[#0081CF] font-mono">
          {payload[0].value} {payload[0].value === 1 ? "entry" : "entries"}
        </p>
      </div>
    );
  }
  return null;
};

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
        <div className="h-24 bg-slate-900/60 rounded-3xl animate-pulse border border-slate-800"></div>
        <CardSkeleton count={4} />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const { stats, charts, recentActivity } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/15 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-[#845EC2]/25 via-[#0081CF]/20 to-[#008F7A]/25 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#845EC2]/30 via-[#0081CF]/20 to-[#008F7A]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-gradient-palette">{user?.name}</span>!
            </h1>
            <RoleBadge role={user?.role} />
          </div>
          <p className="text-xs md:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
            Here is your live organization dashboard — track active projects, employee allocations, task milestones, and real-time activity.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100 bg-slate-950/70 px-4 py-3 rounded-2xl border border-white/15 shadow-md">
            <Clock className="w-4 h-4 text-[#0081CF]" />
            <span>Live Sync Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}

      {/* Primary Statistics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#845EC2]" />
            Core Workforce & Hierarchy
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees}
            icon={Users}
            color="purple"
            subtitle="Across all departments"
          />
          <StatCard
            title="HR Supervisors"
            value={stats?.totalHRs}
            icon={UserCheck}
            color="royal"
            subtitle="HR Department Heads"
          />
          <StatCard
            title="Team Leads"
            value={stats?.totalTeamLeads}
            icon={UserCog}
            color="azure"
            subtitle="Active Project Leads"
          />
          <StatCard
            title="Team Members"
            value={stats?.totalTeamMembers}
            icon={UserCheck2}
            color="emerald"
            subtitle="Operational Staff"
          />
        </div>
      </div>

      {/* Secondary Project & Task Metrics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#008F7A]" />
            Project Lifecycle & Execution
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Projects"
            value={stats?.totalProjects}
            icon={FolderKanban}
            color="purple"
          />
          <StatCard
            title="Active In Progress"
            value={stats?.activeProjects}
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            title="Completed Projects"
            value={stats?.completedProjects}
            icon={CheckCircle2}
            color="royal"
          />
          <StatCard
            title="Task Completion"
            value={stats?.completedTasks}
            icon={CheckSquare}
            color="ocean"
            subtitle={`Out of ${stats?.totalTasks || 0} total tasks`}
          />
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Workforce Distribution */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Workforce Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Breakdown of organizational roles
              </p>
            </div>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.employeesByRole || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.employeesByRole || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      stroke="rgba(15, 23, 42, 0.8)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-slate-300 font-bold capitalize">
                      {value?.replace("_", " ")}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Projects by Status */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white">Project Status Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current lifecycle distribution of company projects
              </p>
            </div>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.projectsByStatus || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="value"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  name="Projects"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800/90 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Live Organizational Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chronological feed of team updates, project assignments, and user operations
            </p>
          </div>
        </div>

        {recentActivity && recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 hover:bg-slate-900/90 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      act.type === "user"
                        ? "bg-purple-400 ring-4 ring-purple-500/10"
                        : act.type === "project"
                        ? "bg-indigo-400 ring-4 ring-indigo-500/10"
                        : "bg-emerald-400 ring-4 ring-emerald-500/10"
                    }`}
                  ></div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                      {act.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {act.description}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 font-mono shrink-0 pl-2">
                  {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : "Just now"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
