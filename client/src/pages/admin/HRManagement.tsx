import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Users,
  Search,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle,
  Eye,
  Building,
} from "lucide-react";
import { userService } from "../../services/userService";
import { taskService } from "../../services/taskService";
import type { Role, User, Task } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { RoleBadge, StatusBadge } from "../../components/ui/Badge";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

interface HRCardData {
  hr: User;
  managedEmployees: User[];
  pendingTasksCount: number;
}

export const HRManagement: React.FC = () => {
  const [hrData, setHrData] = useState<HRCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedHR, setSelectedHR] = useState<HRCardData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const loadHRs = async () => {
    try {
      setLoading(true);
      const [hrsRes, allEmployeesRes, allTasksRes] = await Promise.all([
        userService.list({ role: "hr" as Role, limit: 50 }),
        userService.list({ role: "employee" as Role, limit: 200 }),
        taskService.list({ limit: 500 }),
      ]);

      const hrsList = hrsRes.data || [];
      const employeesList = allEmployeesRes.data || [];
      const tasksList = allTasksRes.data || [];

      const combined: HRCardData[] = hrsList.map((hr) => {
        const managed = employeesList.filter((e) => {
          const hrId = typeof e.hrId === "object" ? e.hrId?._id : e.hrId;
          return hrId === hr._id;
        });

        const managedIds = new Set(managed.map((e) => e._id));
        const pendingTasks = tasksList.filter((t) => {
          const assigneeId = typeof t.assignedTo === "object" ? (t.assignedTo as any)?._id : t.assignedTo;
          return managedIds.has(assigneeId) && t.status !== "completed";
        }).length;

        return {
          hr,
          managedEmployees: managed,
          pendingTasksCount: pendingTasks,
        };
      });

      setHrData(combined);
    } catch (err) {
      console.error("Failed to load HR management data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRs();
  }, []);

  const filteredHRs = hrData.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.hr.name.toLowerCase().includes(term) ||
      item.hr.email.toLowerCase().includes(term) ||
      item.hr.employeeId.toLowerCase().includes(term) ||
      (item.hr.department && item.hr.department.toLowerCase().includes(term))
    );
  });

  const handleOpenDetails = (item: HRCardData) => {
    setSelectedHR(item);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Human Resources Management
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Monitor HR team leads, team allocation, and departmental performance
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search HR by name, ID, department..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total HRs: <span className="font-bold text-slate-900">{hrData.length}</span>
        </div>
      </div>

      {/* HR Cards Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" />
      ) : filteredHRs.length === 0 ? (
        <EmptyState
          title="No HR accounts found"
          description="No HR managers match your search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHRs.map((item) => (
            <div
              key={item.hr._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* HR Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        item.hr.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          item.hr.name,
                        )}&background=8b5cf6&color=fff`
                      }
                      alt={item.hr.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.hr.name}
                      </h4>
                      <p className="text-[11px] font-mono text-purple-700">
                        {item.hr.employeeId}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {item.hr.designation || item.hr.department}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role="hr" />
                </div>

                {/* Contact info */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.hr.email}</span>
                  </div>
                  {item.hr.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.hr.phone}</span>
                    </div>
                  )}
                </div>

                {/* Team metrics */}
                <div className="mt-4 grid grid-cols-2 gap-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100/80">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-purple-700">
                      Team Size
                    </p>
                    <p className="text-lg font-extrabold text-purple-900 mt-0.5">
                      {item.managedEmployees.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-600">
                      Team Tasks
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {item.pendingTasksCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenDetails(item)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Managed Team
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HR Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`HR Profile: ${selectedHR?.hr.name}`}
        subtitle={`Employee ID: ${selectedHR?.hr.employeeId} • ${selectedHR?.hr.department}`}
        maxWidth="2xl"
      >
        {selectedHR && (
          <div className="space-y-5 text-xs">
            {/* Managed Employees List */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Managed Personnel ({selectedHR.managedEmployees.length})</span>
              </h4>

              {selectedHR.managedEmployees.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl">
                  No employees currently assigned to this HR manager.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedHR.managedEmployees.map((emp) => (
                    <div
                      key={emp._id}
                      className="p-3 bg-white flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            emp.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              emp.name,
                            )}&background=6366f1&color=fff`
                          }
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {emp.employeeId} • {emp.designation || emp.department}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            emp.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {emp.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HRManagement;
