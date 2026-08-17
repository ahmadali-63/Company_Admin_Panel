import React, { useState, useEffect } from "react";
import { leaveService } from "../services/leaveService";
import { useAuth } from "../context/AuthContext";
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Stethoscope,
  AlertTriangle,
  Briefcase,
} from "lucide-react";

const Leaves = () => {
  const { user } = useAuth();
  const [myLeaves, setMyLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [formData, setFormData] = useState({
    leaveType: "medical",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [reviewData, setReviewData] = useState({
    status: "approved",
    reviewComment: "",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const isStaffManager = ["admin", "hr", "team_lead"].includes(user?.role);
  const [activeTab, setActiveTab] = useState("my");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const myRes = await leaveService.getMyLeaves(1, 30);
      setMyLeaves(myRes.data.records || []);

      if (isStaffManager) {
        const teamRes = await leaveService.getAllLeaves({ page: 1, limit: 50 });
        setAllLeaves(teamRes.data.records || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load leave records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");
      await leaveService.applyLeave(formData);
      setSuccessMsg("Leave application submitted successfully!");
      setModalOpen(false);
      setFormData({ leaveType: "medical", startDate: "", endDate: "", reason: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewStatus = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");
      await leaveService.updateLeaveStatus(selectedLeave._id, reviewData);
      setSuccessMsg(`Leave request updated to ${reviewData.status}`);
      setReviewModalOpen(false);
      setSelectedLeave(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update leave request");
    } finally {
      setActionLoading(false);
    }
  };

  const getLeaveIcon = (type) => {
    switch (type) {
      case "medical":
        return <Stethoscope className="w-4 h-4 text-emerald-400" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "urgent_work":
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            Leave Application & Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Apply for leave under specified categories (Medical, Emergency, or Urgent Work) and monitor approval statuses.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Messages */}
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

      {/* Tabs */}
      {isStaffManager && (
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800 w-fit text-xs font-semibold">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "my" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            My Leave Applications
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === "team" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Team Applications & Approvals
          </button>
        </div>
      )}

      {/* Leave Applications Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                {activeTab === "team" && <th className="p-3">Applicant</th>}
                <th className="p-3">Category / Reason</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Reason Details</th>
                <th className="p-3">Status</th>
                {activeTab === "team" && <th className="p-3">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(activeTab === "my" ? myLeaves : allLeaves).map((leave) => (
                <tr key={leave._id} className="hover:bg-slate-800/40">
                  {activeTab === "team" && (
                    <td className="p-3">
                      <div className="font-semibold text-slate-200">{leave.userId?.name || "N/A"}</div>
                      <div className="text-[10px] text-slate-400">{leave.userId?.email}</div>
                    </td>
                  )}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getLeaveIcon(leave.leaveType)}
                      <span className="font-bold text-slate-200 capitalize">
                        {leave.leaveType.replace("_", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {leave.startDate} to {leave.endDate}
                  </td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{leave.reason}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                        leave.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : leave.status === "rejected"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {leave.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                      {leave.status === "rejected" && <XCircle className="w-3 h-3" />}
                      {leave.status === "pending" && <Clock className="w-3 h-3" />}
                      {leave.status}
                    </span>
                  </td>
                  {activeTab === "team" && (
                    <td className="p-3">
                      {leave.status === "pending" ? (
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setReviewData({ status: "approved", reviewComment: "" });
                            setReviewModalOpen(true);
                          }}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition-all"
                        >
                          Review Request
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Reviewed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}

              {(activeTab === "my" ? myLeaves : allLeaves).length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-slate-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Apply For Leave
            </h2>
            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Leave Condition / Category</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="medical">Medical Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="urgent_work">Urgent Personal Work</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reason Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide detailed explanation for your leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Review Leave Request</h2>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-300 font-bold">{selectedLeave.userId?.name}</p>
              <p className="text-indigo-400 capitalize font-medium">{selectedLeave.leaveType.replace("_", " ")}</p>
              <p className="text-slate-400 italic">"{selectedLeave.reason}"</p>
            </div>
            <form onSubmit={handleReviewStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Decision</label>
                <select
                  value={reviewData.status}
                  onChange={(e) => setReviewData({ ...reviewData, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reviewer Comment (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Approved, please hand over urgent tasks"
                  value={reviewData.reviewComment}
                  onChange={(e) => setReviewData({ ...reviewData, reviewComment: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20"
                >
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
