import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Filter,
  User as UserIcon,
  Clock,
  FileText,
} from "lucide-react";
import {
  leaveService,
  type RespondLeavePayload,
} from "../../services/leaveService";
import type { Leave, LeaveStatus, LeaveType } from "../../types";
import { StatusBadge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

export const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>(null);

  // Approval / rejection modal
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [responseComment, setResponseComment] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter as LeaveStatus;
      if (typeFilter) params.leaveType = typeFilter as LeaveType;

      const res = await leaveService.list(params);
      if (res.data) setLeaves(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load leave records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, typeFilter, page]);

  const handleOpenRespond = (leave: Leave, type: "approve" | "reject") => {
    setSelectedLeave(leave);
    setActionType(type);
    setResponseComment("");
    setIsRespondModalOpen(true);
  };

  const handleRespondSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      setActionLoading(true);
      const payload: RespondLeavePayload = { responseComment };
      if (actionType === "approve") {
        await leaveService.approve(selectedLeave._id, payload);
      } else {
        await leaveService.reject(selectedLeave._id, payload);
      }
      setIsRespondModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${actionType} leave`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Company Leave Applications & Records
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Review, track, and manage employee leave requests across all departments
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Leave Types</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="casual">Casual Leave</option>
            <option value="emergency">Emergency</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Applications: <span className="font-bold text-slate-900">{pagination?.total || leaves.length}</span>
        </div>
      </div>

      {/* Leave Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" rows={6} />
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No leave records found"
              description="There are no employee leave applications matching your filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-3">Leave Type</th>
                  <th className="py-3 px-3">Date Range</th>
                  <th className="py-3 px-3">Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Approver Notes</th>
                  <th className="py-3 px-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => {
                  const applicant = leave.userId as any;
                  const approver = leave.approvedBy as any;
                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {applicant?.name || "Employee"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {applicant?.employeeId} • {applicant?.department}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="capitalize font-semibold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <div>
                          {new Date(leave.startDate).toLocaleDateString()}
                          {" → "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={leave.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        {leave.responseComment ? (
                          <span>
                            {leave.responseComment}{" "}
                            {approver?.name && (
                              <span className="text-[10px] text-slate-400">({approver.name})</span>
                            )}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {leave.status === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenRespond(leave, "approve")}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRespond(leave, "reject")}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium text-[11px]">
                            Resolved
                          </span>
                        )}
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

      {/* Decision Modal */}
      <Modal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        title={`${actionType === "approve" ? "Approve" : "Reject"} Leave Application`}
        subtitle={`Applicant: ${(selectedLeave?.userId as any)?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleRespondSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-semibold text-slate-700 mb-1">Application Summary:</p>
            <p className="text-slate-600">
              <span className="font-medium">Type:</span> {selectedLeave?.leaveType}
            </p>
            <p className="text-slate-600">
              <span className="font-medium">Dates:</span>{" "}
              {selectedLeave && new Date(selectedLeave.startDate).toLocaleDateString()}
              {" to "}
              {selectedLeave && new Date(selectedLeave.endDate).toLocaleDateString()}
            </p>
            <p className="text-slate-600 mt-1">
              <span className="font-medium">Reason:</span> {selectedLeave?.reason}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {actionType === "approve" ? "Approval Notes" : "Reason for Rejection"}
            </label>
            <textarea
              rows={3}
              value={responseComment}
              onChange={(e) => setResponseComment(e.target.value)}
              placeholder={
                actionType === "approve"
                  ? "e.g. Approved. Please ensure handoff of active tasks."
                  : "e.g. Critical project milestone scheduled for this period."
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRespondModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className={`px-4 py-2 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50 ${
                actionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {actionLoading
                ? "Processing..."
                : actionType === "approve"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
