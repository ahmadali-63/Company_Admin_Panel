import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ProjectHoverCard } from "../../components/ui/HoverPreviewCard";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Users,
  LayoutGrid,
  List,
  Layers,
  ArrowRight,
} from "lucide-react";

const ProjectList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    status: "planning",
    startDate: "",
    endDate: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await API.get("/projects", { params });
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      status: "planning",
      startDate: "",
      endDate: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name || "",
      code: proj.code || "",
      description: proj.description || "",
      status: proj.status || "planning",
      startDate: proj.startDate ? proj.startDate.split("T")[0] : "",
      endDate: proj.endDate ? proj.endDate.split("T")[0] : "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name || !formData.code) {
      setFormError("Project Name and Project Code are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingProject) {
        await API.put(`/projects/${editingProject._id}`, formData);
      } else {
        await API.post("/projects", formData);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await API.delete(`/projects/${deleteDialog.id}`);
      setDeleteDialog({ open: false, id: null, name: "" });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const canCreate = user?.role === "admin";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-6 h-6 text-[#c084fc]" />
            Projects Workspace
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Track active deliverables, deadlines, team leads, and project assignments
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-2xl btn-purple-glow text-xs font-extrabold flex items-center justify-center gap-2 active:scale-95 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
            Create Project
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 md:p-4 rounded-3xl border border-white/15 shadow-2xl bg-[#0a0f26]/85 backdrop-blur-2xl flex flex-col md:flex-row items-center gap-3.5">
        <div className="relative flex-1 w-full group">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#c084fc] group-focus-within:text-[#7dd3fc] transition-colors" />
          <input
            type="text"
            placeholder="Search projects by name, code, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 font-medium focus:outline-none focus:border-[#845EC2] focus:ring-4 focus:ring-[#845EC2]/20 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-slate-200 font-extrabold focus:outline-none focus:border-[#0081CF] focus:ring-2 focus:ring-[#0081CF]/25 transition-all shadow-inner hover:border-white/20 cursor-pointer"
          >
            <option value="">All Lifecycle Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#060918]/90 rounded-2xl border border-white/10 shrink-0 shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "gradient-palette-bg text-white shadow-lg shadow-[#0081CF]/30 border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === "table"
                  ? "gradient-palette-bg text-white shadow-lg shadow-[#0081CF]/30 border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No Projects Found"
          description="There are currently no projects matching your filter criteria."
          actionButton={
            canCreate && (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Create First Project
              </button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        /* Rich Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p._id}
              className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/90 shadow-xl flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm">
                    {p.code}
                  </span>
                  <StatusBadge status={p.status} />
                </div>

                <ProjectHoverCard project={p}>
                  <div className="cursor-pointer">
                    <h3 className="font-extrabold text-white text-base group-hover:text-indigo-300 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {p.description || "No description provided for this project."}
                    </p>
                  </div>
                </ProjectHoverCard>

                {/* Team Counts Card */}
                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs text-slate-400 text-center">
                  <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <p className="font-extrabold text-white text-sm">
                      {p.hrIds?.length || 0}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                      HRs
                    </p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <p className="font-extrabold text-emerald-400 text-sm">
                      {p.teamLeadIds?.length || 0}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                      Leads
                    </p>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <p className="font-extrabold text-indigo-400 text-sm">
                      {p.memberIds?.length || 0}
                    </p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                      Members
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  to={`/projects/${p._id}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:bg-indigo-600"
                >
                  <Eye className="w-4 h-4" />
                  View Workspace
                </Link>

                {canCreate && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteDialog({ open: true, id: p._id, name: p.name })
                      }
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* High Density Table View */
        <div className="glass-panel rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 uppercase font-extrabold text-[10px] text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Project Code</th>
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Team Allocation</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-indigo-300">
                      {p.code}
                    </td>
                    <td className="px-6 py-4">
                      <ProjectHoverCard project={p}>
                        <div className="cursor-pointer">
                          <p className="font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                            {p.description || "No description"}
                          </p>
                        </div>
                      </ProjectHoverCard>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-300 font-bold">
                        {(p.memberIds?.length || 0) +
                          (p.teamLeadIds?.length || 0) +
                          (p.hrIds?.length || 0)}{" "}
                        members
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/projects/${p._id}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {canCreate && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                              title="Edit Project"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteDialog({
                                  open: true,
                                  id: p._id,
                                  name: p.name,
                                })
                              }
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? `Edit Project: ${editingProject.name}` : "Create New Project"}
        subtitle="Configure the project workspace metadata and timeline"
        icon={FolderKanban}
      >
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Project Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Project Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. PRJ-01"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Project Lifecycle Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingProject ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to permanently delete project ${deleteDialog.name}? Associated tasks and employee allocations will be detached.`}
        confirmText="Delete Project"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ProjectList;
