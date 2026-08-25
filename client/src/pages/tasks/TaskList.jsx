import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  UserHoverCard,
  ProjectHoverCard,
} from "../../components/ui/HoverPreviewCard";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  User,
  LayoutGrid,
  List,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedTo: "",
    priority: "medium",
    dueDate: "",
    status: "pending",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Users available for assignment (filtered by selected project members)
  const [projectMembers, setProjectMembers] = useState([]);

  // Confirm Delete
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null,
    title: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (selectedProjectId) params.projectId = selectedProjectId;

      const res = await API.get("/tasks", { params });
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsList = async () => {
    try {
      const res = await API.get("/projects");
      if (res.data.success) setProjects(res.data.projects);
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, selectedProjectId]);

  useEffect(() => {
    fetchProjectsList();
  }, []);

  // When project changes in task modal, populate valid assignees
  useEffect(() => {
    if (formData.projectId) {
      const foundProject = projects.find((p) => p._id === formData.projectId);
      if (foundProject) {
        const combined = [
          ...(foundProject.hrIds || []),
          ...(foundProject.teamLeadIds || []),
          ...(foundProject.memberIds || []),
        ];
        const unique = Array.from(
          new Map(combined.map((m) => [m._id || m, m])).values()
        );
        setProjectMembers(unique);
      }
    } else {
      setProjectMembers([]);
    }
  }, [formData.projectId, projects]);

  const canCreateTask = user?.role !== "team_member";

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      projectId: projects[0]?._id || "",
      assignedTo: "",
      priority: "medium",
      dueDate: "",
      status: "pending",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      projectId: task.projectId?._id || task.projectId || "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      status: task.status || "pending",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title || !formData.projectId || !formData.assignedTo) {
      setFormError("Title, Project, and Assigned Employee are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, formData);
      } else {
        await API.post("/tasks", formData);
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChangeQuick = async (task, newStatus) => {
    try {
      await API.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task status.");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await API.delete(`/tasks/${deleteDialog.id}`);
      setDeleteDialog({ open: false, id: null, title: "" });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete task.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#c084fc]" />
            Task Management & Assignments
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Allocate task assignments, monitor deliverables, and update completion statuses
          </p>
        </div>
        {canCreateTask && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-2xl btn-purple-glow text-xs font-extrabold flex items-center justify-center gap-2 active:scale-95 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
            Create Task
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 md:p-4 rounded-3xl border border-white/15 shadow-2xl bg-[#0a0f26]/85 backdrop-blur-2xl flex flex-col md:flex-row items-center gap-3.5">
        <div className="relative flex-1 w-full group">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#c084fc] group-focus-within:text-[#7dd3fc] transition-colors" />
          <input
            type="text"
            placeholder="Search tasks by title, deliverable description..."
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
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-slate-200 font-extrabold focus:outline-none focus:border-[#0081CF] focus:ring-2 focus:ring-[#0081CF]/25 transition-all shadow-inner hover:border-white/20 cursor-pointer"
          >
            <option value="">All Projects Workspace</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} [{p.code}]
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-slate-200 font-extrabold focus:outline-none focus:border-[#0081CF] focus:ring-2 focus:ring-[#0081CF]/25 transition-all shadow-inner hover:border-white/20 cursor-pointer"
          >
            <option value="">All Task Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
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

      {/* Task Content */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Found"
          description="There are currently no tasks matching the selected filters."
          actionButton={
            canCreateTask && (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
              >
                Create First Task
              </button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-800/90 shadow-xl flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header: Priority & Status */}
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={t.priority} />
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChangeQuick(t, e.target.value)}
                    className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] font-extrabold text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-extrabold text-white text-sm group-hover:text-indigo-300 transition-colors">
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>

                {/* Project Badge */}
                {t.projectId && (
                  <ProjectHoverCard project={t.projectId}>
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between cursor-pointer">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Project
                      </span>
                      <span className="font-bold text-indigo-300 truncate max-w-[150px]">
                        {t.projectId.name}
                      </span>
                    </div>
                  </ProjectHoverCard>
                )}

                {/* Assignee Card */}
                {t.assignedTo && (
                  <UserHoverCard user={t.assignedTo}>
                    <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-800/80 cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {t.assignedTo.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {t.assignedTo.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {t.assignedTo.email}
                        </p>
                      </div>
                    </div>
                  </UserHoverCard>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {t.dueDate
                    ? new Date(t.dueDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })
                    : "No deadline"}
                </span>

                {canCreateTask && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteDialog({ open: true, id: t._id, title: t.title })
                      }
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 uppercase font-extrabold text-[10px] text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Task Title</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tasks.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-bold text-white">
                      <div>
                        <p className="group-hover:text-indigo-300 transition-colors">
                          {t.title}
                        </p>
                        {t.description && (
                          <p className="text-[11px] text-slate-400 font-normal line-clamp-1 mt-0.5">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.projectId ? (
                        <ProjectHoverCard project={t.projectId}>
                          <div className="cursor-pointer">
                            <span className="font-bold text-slate-200">
                              {t.projectId.name}
                            </span>
                            {t.projectId.code && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                [{t.projectId.code}]
                              </p>
                            )}
                          </div>
                        </ProjectHoverCard>
                      ) : (
                        <span className="text-slate-500">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {t.assignedTo ? (
                        <UserHoverCard user={t.assignedTo}>
                          <span className="font-bold text-indigo-400 cursor-pointer">
                            {t.assignedTo.name}
                          </span>
                        </UserHoverCard>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          handleStatusChangeQuick(t, e.target.value)
                        }
                        className="px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canCreateTask && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                id: t._id,
                                title: t.title,
                              })
                            }
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? `Edit Task: ${editingTask.title}` : "Create New Task"}
        subtitle="Specify task scope, project assignment, and execution priority"
        icon={CheckSquare}
      >
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement auth refresh token rotation"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Description</label>
            <textarea
              rows={3}
              placeholder="Provide context and requirements..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Target Project *</label>
              <select
                required
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectId: e.target.value,
                    assignedTo: "",
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} [{p.code}]
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Assign To Employee *</label>
              <select
                required
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                disabled={!formData.projectId}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-medium disabled:opacity-50"
              >
                <option value="">Select Project Member</option>
                {projectMembers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.role?.replace("_", " ")})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
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
              {submitting ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, title: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to permanently delete task "${deleteDialog.title}"?`}
        confirmText="Delete Task"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TaskList;
