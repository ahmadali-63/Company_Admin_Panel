import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Clock,
  Briefcase,
  CheckSquare,
  AlertCircle,
  CalendarDays,
  ArrowUpRight,
  PlusCircle,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { statsService, type AdminDashboardData } from "../../services/statsService";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge, PriorityBadge, RoleBadge } from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

const PIE_COLORS = ["#10B981", "#EF4444", "#F59E0B", "#6366F1", "#06B6D4"];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await statsService.getDashboard();
      setData(res as unknown as AdminDashboardData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Executive Overview</h2>
            <p className="text-xs text-slate-500">Real-time company metrics</p>
          </div>
        </div>
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12">
        <EmptyState
          title="Dashboard Unavailable"
          description={error || "Could not retrieve dashboard statistics."}
          actionText="Try Again"
          onAction={loadDashboard}
        />
      </div>
    );
  }

  const { stats, charts, todayAttendance, upcomingDeadlines, overdueTasks } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Overview & Analytics
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Real-time administrative operations, workforce attendance, and task status
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/employees"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add User
          </Link>
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            New Project
          </Link>
        </div>
      </div>

      {/* Top 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={stats.totalStaff || stats.totalEmployees + stats.totalHRs}
          subtitle={`${stats.totalEmployees} Employees • ${stats.totalHRs} HRs`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle={`${stats.currentlyInOffice} currently in office`}
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Absent / On Leave"
          value={`${stats.absentToday} / ${stats.onLeave}`}
          subtitle={`${stats.pendingLeaves} pending leave approvals`}
          icon={CalendarDays}
          color="amber"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          subtitle={`${stats.totalProjects} total projects in company`}
          icon={Briefcase}
          color="blue"
        />
      </div>

      {/* Task Summary Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Pending Tasks</p>
            <h4 className="text-xl font-bold text-slate-800 mt-1">{stats.pendingTasks}</h4>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">In Progress</p>
            <h4 className="text-xl font-bold text-blue-600 mt-1">{stats.inProgressTasks}</h4>
          </div>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Completed</p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">{stats.completedTasks}</h4>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-rose-600 uppercase">Overdue Tasks</p>
            <h4 className="text-xl font-bold text-rose-600 mt-1">{stats.overdueTasks}</h4>
          </div>
          <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Attendance Overview</h3>
              <p className="text-xs text-slate-500">Live breakdown of company workforce attendance</p>
            </div>
            <Link
              to="/admin/attendance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Log <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.attendanceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.attendanceBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                    />
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

        {/* Task Status Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Status Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of all company task assignments</p>
            </div>
            <Link
              to="/admin/tasks"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              All Tasks <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.taskStatusDistribution}>
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
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Section: Live Today Attendance & Critical Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Today's Attendance Register
            </h3>
            <Link
              to="/admin/attendance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              See All ({todayAttendance.length})
            </Link>
          </div>

          <div className="overflow-x-auto">
            {todayAttendance.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No attendance submitted yet today.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-3">Check In</th>
                    <th className="py-3 px-3">Check Out</th>
                    <th className="py-3 px-3">Hours</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAttendance.slice(0, 6).map((record) => {
                    const u = record.userId as any;
                    return (
                      <tr key={record._id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{u?.name || "Staff"}</div>
                          <div className="text-[10px] text-slate-400">{u?.employeeId} • {u?.department}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {new Date(record.checkIn).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {record.checkOut
                            ? new Date(record.checkOut).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {record.workingHours || "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <StatusBadge status={record.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Critical & Overdue Tasks */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Overdue & Critical Tasks
            </h3>
            <Link
              to="/admin/tasks"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage Tasks
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {overdueTasks.length === 0 && upcomingDeadlines.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                All tasks are on track. No overdue items.
              </div>
            ) : (
              [...overdueTasks, ...upcomingDeadlines].slice(0, 6).map((task) => (
                <div
                  key={task._id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                >
                  <div className="space-y-1 max-w-sm">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Assignee: {(task.assignedTo as any)?.name || "Employee"}</span>
                      <span>•</span>
                      <span className="text-rose-600 font-medium">
                        Due {new Date(task.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
