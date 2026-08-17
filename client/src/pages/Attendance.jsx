import React, { useState, useEffect } from "react";
import { attendanceService } from "../services/attendanceService";
import { useAuth } from "../context/AuthContext";
import { Clock, LogIn, LogOut, Calendar, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

const Attendance = () => {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  const isStaffManager = ["admin", "hr", "team_lead"].includes(user?.role);
  const [tab, setTab] = useState("my"); // "my" or "team"

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const todayRes = await attendanceService.getTodayStatus();
      setTodayRecord(todayRes.data);

      const myRes = await attendanceService.getMyAttendance(1, 20);
      setRecords(myRes.data.records || []);

      if (isStaffManager) {
        const teamRes = await attendanceService.getAllAttendance({ page: 1, limit: 30 });
        setAllRecords(teamRes.data.records || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");
      const res = await attendanceService.checkIn(notes);
      setTodayRecord(res.data);
      setSuccessMsg("Checked in successfully! Attendance timestamp recorded by server.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to check in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");
      const res = await attendanceService.checkOut();
      setTodayRecord(res.data);
      setSuccessMsg("Checked out successfully! Attendance time logged.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to check out");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-400" />
            Office Attendance Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automatic time tracking when you enter and leave the office. Timestamps are securely captured by system clock.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
          <span className="font-mono font-bold text-lg text-slate-200">{currentTime}</span>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Clock In / Out Action Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 mb-1">Today's Office Status</h2>
            <p className="text-xs text-slate-400 mb-4">
              Date: <span className="text-slate-200 font-semibold">{new Date().toISOString().split("T")[0]}</span>
            </p>

            {todayRecord ? (
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Check-in Time:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {new Date(todayRecord.checkIn).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Check-out Time:</span>
                  <span className="font-mono font-bold text-amber-400">
                    {todayRecord.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString() : "Not Checked Out Yet"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Status:</span>
                  <span className="capitalize font-bold text-indigo-400">{todayRecord.status}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                You haven't checked in for today yet. Click below when entering the office.
              </div>
            )}
          </div>

          <div className="space-y-3">
            {!todayRecord ? (
              <>
                <input
                  type="text"
                  placeholder="Optional note (e.g. Working from Desk A4)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  Clock In (Office Entry)
                </button>
              </>
            ) : !todayRecord.checkOut ? (
              <button
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Clock Out (Office Departure)
              </button>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold text-center">
                Today's attendance completed!
              </div>
            )}
          </div>
        </div>

        {/* History / Logs Table */}
        <div className="md:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Attendance Records
            </h2>
            {isStaffManager && (
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTab("my")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    tab === "my" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  My Logs
                </button>
                <button
                  onClick={() => setTab("team")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    tab === "team" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Team/Company Logs
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  {tab === "team" && <th className="p-3">Employee</th>}
                  <th className="p-3">Date</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(tab === "my" ? records : allRecords).map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-800/40">
                    {tab === "team" && (
                      <td className="p-3">
                        <div className="font-semibold text-slate-200">{rec.userId?.name || "N/A"}</div>
                        <div className="text-[10px] text-slate-400">{rec.userId?.email}</div>
                      </td>
                    )}
                    <td className="p-3 font-mono text-slate-200">{rec.date}</td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">
                      {rec.checkIn ? new Date(rec.checkIn).toLocaleTimeString() : "-"}
                    </td>
                    <td className="p-3 font-mono text-amber-400 font-semibold">
                      {rec.checkOut ? new Date(rec.checkOut).toLocaleTimeString() : "Active"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                          rec.status === "present"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : rec.status === "half_day"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 truncate max-w-[150px]">{rec.notes || "-"}</td>
                  </tr>
                ))}

                {(tab === "my" ? records : allRecords).length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center p-6 text-slate-500">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
