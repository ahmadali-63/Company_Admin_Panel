import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Building,
} from "lucide-react";
import { attendanceService } from "../../services/attendanceService";
import type { Attendance, AttendanceStatus } from "../../types";
import { StatusBadge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

export const AttendanceOverview: React.FC = () => {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };
      if (dateFilter) params.date = dateFilter;
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;

      const res = await attendanceService.list(params);
      if (res.data) setRecords(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load attendance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, statusFilter, deptFilter, page]);

  const presentCount = records.filter(
    (r) => r.status === "Present" || r.status === "Checked Out",
  ).length;
  const lateCount = records.filter((r) => r.status === "Late").length;
  const halfDayCount = records.filter((r) => r.status === "Half Day").length;

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = "Employee ID,Name,Role,Department,Date,Check In,Check Out,Working Hours,Status,Notes\n";
    const rows = records
      .map((r) => {
        const u = r.userId as any;
        const checkInStr = new Date(r.checkIn).toLocaleTimeString();
        const checkOutStr = r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "N/A";
        return `"${u?.employeeId || ""}","${u?.name || ""}","${u?.role || ""}","${u?.department || ""}","${r.date}","${checkInStr}","${checkOutStr}","${r.workingHours || ""}","${r.status}","${r.notes || ""}"`;
      })
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_export_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Company Attendance Register & Logs
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Monitor punctuality, live check-ins, working hours, and departure records
          </p>
        </div>
        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export to CSV
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">On-Time Arrivals</p>
            <h4 className="text-xl font-bold text-emerald-600 mt-1">{presentCount}</h4>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Late Arrivals</p>
            <h4 className="text-xl font-bold text-amber-600 mt-1">{lateCount}</h4>
          </div>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Half Day Records</p>
            <h4 className="text-xl font-bold text-slate-800 mt-1">{halfDayCount}</h4>
          </div>
          <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Date:
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="Checked Out">Checked Out</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="DevOps">DevOps</option>
          </select>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" rows={6} />
          </div>
        ) : records.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No attendance records found"
              description={`No personnel recorded attendance on ${dateFilter || "selected date"}.`}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-3">Role & Dept</th>
                  <th className="py-3 px-3">Check-In Time</th>
                  <th className="py-3 px-3">Check-Out Time</th>
                  <th className="py-3 px-3">Working Hours</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const u = rec.userId as any;
                  return (
                    <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u?.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                u?.name || "User",
                              )}&background=6366f1&color=fff`
                            }
                            alt={u?.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{u?.name || "Staff Member"}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u?.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 capitalize">{u?.role}</div>
                        <div className="text-[11px] text-slate-500">{u?.department || "-"}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {new Date(rec.checkIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {rec.checkOut
                          ? new Date(rec.checkOut).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : <span className="text-slate-400">In Office</span>}
                      </td>
                      <td className="py-3 px-3 font-semibold text-indigo-600">
                        {rec.workingHours || "Active"}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={rec.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 max-w-xs truncate">
                        {rec.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default AttendanceOverview;
