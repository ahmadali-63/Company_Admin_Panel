import React, { useState, useEffect } from "react";
import { leaveService } from "../services/leaveService";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/ui/Modal";
import EmptyState from "../components/ui/EmptyState";
import { TableSkeleton } from "../components/ui/LoadingSkeleton";
import { UserHoverCard } from "../components/ui/HoverPreviewCard";
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
  Calendar,
  Sparkles,
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

  const isAdmin = user?.role === "admin";
  const isStaffManager = ["admin", "hr", "team_lead"].includes(user?.role);
  const [activeTab, setActiveTab] = useState(isAdmin ? "team" : "my");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!isAdmin) {
        const myRes = await leaveService.getMyLeaves(1, 30);
        setMyLeaves(myRes.data.records || []);
      }

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
      setFormData({
        leaveType: "medical",
        startDate: "",
        endDate: "",
        reason: "",
      });
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
        return <Stethoscope className="w-4 h-4 text-rose-400" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Briefcase className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#c084fc]" />
            Leave & Time-Off Management
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
            Submit time-off requests, check application approvals, and review team absence schedules.
          </p>
        </div>

        {!isAdmin && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl btn-purple-glow text-xs font-extrabold flex items-center justify-center gap-2 active:scale-95 group shrink-0 z-10"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
            Apply For Leave
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      {isStaffManager && (
        <div className="flex items-center gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/90 w-fit">
          {!isAdmin && (
            <button
              onClick={() => setActiveTab("my")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === "my"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              My Leave Requests
            </button>
          )}
          <button
            onClick={() => setActiveTab("team")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "team"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Team Applications Queue
          </button>
        </div>
      )}

      {/* Leave Table / List */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (activeTab === "my" ? myLeaves : allLeaves).length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Leave Requests"
          description="There are currently no leave records in this category."
          actionButton={
            !isAdmin ? (
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Apply For Leave
              </button>
            ) : null
          }
        />
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 uppercase font-extrabold text-[10px] text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  {activeTab === "team" && <th className="px-6 py-4">Applicant</th>}
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                  <th className="px-6 py-4">Status</th>
                  {activeTab === "team" && (
                    <th className="px-6 py-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(activeTab === "my" ? myLeaves : allLeaves).map((leave) => (
                  <tr
                    key={leave._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {activeTab === "team" && (
                      <td className="px-6 py-4 font-bold text-white">
                        {leave.userId ? (
                          <UserHoverCard user={leave.userId}>
                            <span className="cursor-pointer group-hover:text-indigo-300 transition-colors">
                              {leave.userId.name}
                            </span>
                          </UserHoverCard>
                        ) : (
                          "Staff Member"
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-bold text-slate-200 capitalize">
                        {getLeaveIcon(leave.leaveType)}
                        <span>{leave.leaveType.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-300">
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider border shadow-sm ${
                          leave.status === "approved"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : leave.status === "rejected"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {leave.status === "approved" && (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {leave.status === "rejected" && (
                          <XCircle className="w-3 h-3" />
                        )}
                        {leave.status === "pending" && (
                          <Clock className="w-3 h-3 animate-spin" />
                        )}
                        {leave.status}
                      </span>
                    </td>
                    {activeTab === "team" && (
                      <td className="px-6 py-4 text-right">
                        {leave.status === "pending" ? (
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setReviewData({
                                status: "approved",
                                reviewComment: "",
                              });
                              setReviewModalOpen(true);
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            Reviewed
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Apply For Leave"
        subtitle="Submit a formal time-off application for managerial approval"
        icon={FileText}
      >
        <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              Leave Category *
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) =>
                setFormData({ ...formData, leaveType: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="medical">Medical Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="urgent_work">Urgent Personal Work</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">
              Reason / Explanation *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide context and notes regarding your leave..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Leave Application"
        subtitle="Approve or decline the applicant's time-off request"
        icon={CheckCircle2}
      >
        {selectedLeave && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Applicant
                </span>
                <span className="font-extrabold text-white">
                  {selectedLeave.userId?.name}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Category
                </span>
                <span className="font-bold text-indigo-400 capitalize">
                  {selectedLeave.leaveType.replace("_", " ")}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 font-bold uppercase text-[10px]">
                  Reason
                </span>
                <p className="text-slate-300 italic mt-0.5">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            <form onSubmit={handleReviewStatus} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">Decision *</label>
                <select
                  value={reviewData.status}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 font-extrabold focus:outline-none focus:border-indigo-500"
                >
                  <option value="approved">Approve Application</option>
                  <option value="rejected">Decline Application</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-300">
                  Reviewer Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Approved, please coordinate with team lead."
                  value={reviewData.reviewComment}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      reviewComment: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {actionLoading ? "Submitting..." : "Confirm Decision"}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Leaves;
