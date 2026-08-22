import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Building,
} from "lucide-react";
import {
  projectService,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from "../../services/projectService";
import { userService } from "../../services/userService";
import type { Project, ProjectStatus, Role, User } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { StatusBadge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

export const ProjectManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [hrs, setHrs] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Form data
  const [formData, setFormData] = useState<CreateProjectPayload>({
    name: "",
    code: "",
    description: "",
    status: "active",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    hrIds: [],
    employeeIds: [],
  });

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await projectService.list(params);
      if (res.data) setProjects(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const [hrsRes, empRes] = await Promise.all([
        userService.list({ role: "hr" as Role, limit: 50 }),
        userService.list({ role: "employee" as Role, limit: 100 }),
      ]);
      if (hrsRes.data) setHrs(hrsRes.data);
      if (empRes.data) setEmployees(empRes.data);
    } catch (err) {
      console.error("Failed to load staff list:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      hrIds: hrs[0] ? [hrs[0]._id] : [],
      employeeIds: [],
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setSelectedProject(project);
    const hrIdList = (project.hrIds || []).map((h) =>
      typeof h === "object" ? (h as any)._id : h,
    );
    const empIdList = (project.employeeIds || project.memberIds || []).map((e) =>
      typeof e === "object" ? (e as any)._id : e,
    );

    setFormData({
      name: project.name,
      code: project.code,
      description: project.description || "",
      status: project.status,
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
      hrIds: hrIdList,
      employeeIds: empIdList,
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormError("");
      await projectService.create(formData);
      setIsAddModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || "Failed to create project",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      setFormLoading(true);
      setFormError("");
      await projectService.update(selectedProject._id, formData);
      setIsEditModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || "Failed to update project",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    try {
      setFormLoading(true);
      await projectService.remove(selectedProject._id);
      setIsDeleteDialogOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete project");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleHrSelection = (hrId: string) => {
    const current = formData.hrIds || [];
    if (current.includes(hrId)) {
      setFormData({ ...formData, hrIds: current.filter((id) => id !== hrId) });
    } else {
      setFormData({ ...formData, hrIds: [...current, hrId] });
    }
  };

  const toggleEmpSelection = (empId: string) => {
    const current = formData.employeeIds || [];
    if (current.includes(empId)) {
      setFormData({
        ...formData,
        employeeIds: current.filter((id) => id !== empId),
      });
    } else {
      setFormData({ ...formData, employeeIds: [...current, empId] });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            Project Management
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Oversee company projects, manage assignments, and track milestones
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name or code..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="There are no company projects matching your filter."
          actionText="Create Project"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const hrMembers = proj.hrIds || [];
            const empMembers = proj.employeeIds || proj.memberIds || [];

            return (
              <div
                key={proj._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {proj.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">
                        {proj.name}
                      </h4>
                    </div>
                    <StatusBadge status={proj.status} size="sm" />
                  </div>

                  <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {proj.description || "No description provided."}
                  </p>

                  {/* Dates */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {proj.startDate
                        ? new Date(proj.startDate).toLocaleDateString()
                        : "TBD"}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {proj.endDate
                        ? new Date(proj.endDate).toLocaleDateString()
                        : "Ongoing"}
                    </span>
                  </div>

                  {/* Team Members */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span>Assigned Staff</span>
                      <span className="font-semibold text-slate-700">
                        {hrMembers.length + empMembers.length} Members
                      </span>
                    </div>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {[...hrMembers, ...empMembers].slice(0, 6).map((m: any, i) => (
                        <img
                          key={m._id || i}
                          src={
                            m.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              m.name || "Member",
                            )}&background=4f46e5&color=fff`
                          }
                          alt={m.name}
                          title={m.name}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                    title="Edit Project"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(proj);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? "Create New Project" : `Edit Project: ${selectedProject?.name}`}
        subtitle="Manage project details and team assignments in MongoDB"
        maxWidth="2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {formError}
          </div>
        )}

        <form
          onSubmit={isAddModalOpen ? handleCreateProject : handleUpdateProject}
          className="space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Mobile Banking App v3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="e.g. MOB-2026"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 uppercase font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Scope of work and objectives..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProjectStatus,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target End Date
              </label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* HR Assignment selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assign HR Supervisors
            </label>
            <div className="max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              {hrs.map((h) => (
                <label
                  key={h._id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(formData.hrIds || []).includes(h._id)}
                    onChange={() => toggleHrSelection(h._id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-800 font-medium">{h.name}</span>
                  <span className="text-slate-400 text-[10px]">({h.employeeId})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Employee Assignment selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Assign Engineers & Team Members
            </label>
            <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              {employees.map((emp) => (
                <label
                  key={emp._id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(formData.employeeIds || []).includes(emp._id)}
                    onChange={() => toggleEmpSelection(emp._id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-800 font-medium">{emp.name}</span>
                  <span className="text-slate-400 text-[10px]">
                    ({emp.employeeId} • {emp.designation || emp.department})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium shadow-xs disabled:opacity-50"
            >
              {formLoading ? "Saving..." : isAddModalOpen ? "Create Project" : "Update Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete project ${selectedProject?.name} [${selectedProject?.code}]? All attached tasks will be removed.`}
        confirmText="Delete Project"
        isLoading={formLoading}
      />
    </div>
  );
};

export default ProjectManagement;
