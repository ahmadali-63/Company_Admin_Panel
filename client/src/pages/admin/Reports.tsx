import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Briefcase,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { statsService, type AdminDashboardData } from "../../services/statsService";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

export const Reports: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await statsService.getDashboard();
        setData(res as unknown as AdminDashboardData);
      } catch (err) {
        console.error("Failed to load reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !data) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const { stats, charts } = data;

  const attendanceRate =
    stats.totalStaff > 0
      ? Math.round((stats.presentToday / stats.totalStaff) * 100)
      : 0;

  const taskCompletionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Executive Reports & Company Analytics
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Workforce attendance benchmarks, project velocity, and completion metrics
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Attendance Rate</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{attendanceRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">
            {stats.presentToday} of {stats.totalStaff} staff members present today
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Task Completion Velocity</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{taskCompletionRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">
            {stats.completedTasks} completed out of {stats.totalTasks} total tasks
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Active Project Load</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.activeProjects}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {stats.totalProjects} total projects in company pipeline
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Staffing Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Department Personnel Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Employee count across functional company units
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.departmentDistribution}>
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Pipeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Project Lifecycle Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Current stages of all projects in the portfolio
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.projectStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.projectStatusDistribution.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
