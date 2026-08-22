import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  MessageSquare,
  Edit2,
  Trash2,
  AlertCircle,
  Eye,
  Send,
  User,
} from "lucide-react";
import {
  taskService,
  type CreateTaskPayload,
  type UpdateTaskPayload,
} from "../../services/taskService";
import { projectService } from "../../services/projectService";
import { userService } from "../../services/userService";
import type { Project, Role, Task, TaskPriority, TaskStatus, User as UserType } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { PriorityBadge, StatusBadge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

export const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<UserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Form data
  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: "",
    description: "",
    projectId: null,
    assignedTo: "",
    priority: "medium",
    status: "pending",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (projectFilter) params.projectId = projectFilter;

      const res = await taskService.list(params);
      if (res.data) setTasks(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [projRes, empRes] = await Promise.all([
        projectService.list({ limit: 100 }),
        userService.list({ role: "employee" as Role, limit: 200 }),
      ]);
      if (projRes.data) setProjects(projRes.data);
      if (empRes.data) setEmployees(empRes.data);
    } catch (err) {
      console.error("Failed to load project/employee metadata:", err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [page, statusFilter, priorityFilter, projectFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTasks();
  };

  const handleOpenAdd = () => {
    setFormData({
      title: "",
      description: "",
      projectId: projects[0]?._id || null,
      assignedTo: employees[0]?._id || "",
      priority: "medium",
      status: "pending",
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    const projId =
      typeof task.projectId === "object" ? task.projectId?._id : task.projectId;
    const assignId =
      typeof task.assignedTo === "object"
        ? (task.assignedTo as any)?._id
        : task.assignedTo;

    setFormData({
      title: task.title,
      description: task.description || "",
      projectId: projId || null,
      assignedTo: assignId,
      priority: task.priority,
      status: task.status,
      deadline: task.deadline
        ? new Date(task.deadline).toISOString().split("T")[0]
        : "",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setNewComment("");
    setIsDetailModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormError("");
      await taskService.create(formData);
      setIsAddModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || "Failed to create task",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      setFormLoading(true);
      setFormError("");
      await taskService.update(selectedTask._id, formData);
      setIsEditModalOpen(false);
      fetchTasks();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || "Failed to update task",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      setFormLoading(true);
      await taskService.remove(selectedTask._id);
      setIsDeleteDialogOpen(false);
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete task");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;
    try {
      setFormLoading(true);
      const res = await taskService.addComment(selectedTask._id, newComment.trim());
      if (res.data) {
        setSelectedTask(res.data);
      }
      setNewComment("");
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to post comment");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            Company Task Management
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Create, assign, monitor, and review task execution company-wide
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Assign New Task
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" rows={6} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No tasks found"
              description="There are no company tasks matching your filter selection."
              actionText="Create Task"
              onAction={handleOpenAdd}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Task Details</th>
                  <th className="py-3 px-3">Project</th>
                  <th className="py-3 px-3">Assignee</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const proj = task.projectId as any;
                  const assignee = task.assignedTo as any;
                  const isOverdue =
                    task.status === "overdue" ||
                    (task.status !== "completed" &&
                      new Date() > new Date(task.deadline));

                  return (
                    <tr
                      key={task._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOverdue ? "bg-rose-50/20" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {task.description || "No instructions provided."}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {proj?.name ? (
                          <span>
                            {proj.name}{" "}
                            <span className="text-[10px] text-slate-400 font-mono">
                              [{proj.code}]
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">General</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              assignee?.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                assignee?.name || "User",
                              )}&background=4f46e5&color=fff`
                            }
                            alt={assignee?.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-800">
                            {assignee?.name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-3 px-3">
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue ? "text-rose-600 font-bold" : "text-slate-600"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={task.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(task)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="View Details & Comments"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(task)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
        }}
        title={isAddModalOpen ? "Assign New Task" : "Edit Task"}
        subtitle="Manage task requirements, project attachment, and deadline"
        maxWidth="2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {formError}
          </div>
        )}

        <form
          onSubmit={isAddModalOpen ? handleCreateTask : handleUpdateTask}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g. Implement Biometric Authentication"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Task Instructions & Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Detailed guidelines and expected deliverables..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Project
              </label>
              <select
                value={formData.projectId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectId: e.target.value ? e.target.value : null,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">General (No project)</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Personnel *
              </label>
              <select
                required
                value={formData.assignedTo}
                onChange={(e) =>
                  setFormData({ ...formData, assignedTo: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId}) - {emp.department}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as TaskStatus,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
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
              {formLoading
                ? "Saving..."
                : isAddModalOpen
                ? "Assign Task"
                : "Update Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Detail & Comments Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedTask?.title || "Task Details"}
        subtitle={`Deadline: ${
          selectedTask?.deadline
            ? new Date(selectedTask.deadline).toLocaleDateString()
            : ""
        }`}
        maxWidth="2xl"
      >
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">Priority & Status</span>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={selectedTask.priority} />
                  <StatusBadge status={selectedTask.status} size="sm" />
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Assigned To: </span>
                <span className="text-slate-800 font-bold">
                  {(selectedTask.assignedTo as any)?.name || "Employee"}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed pt-1">
                {selectedTask.description || "No description provided."}
              </p>
            </div>

            {/* Comments Thread */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Work Updates & Comments ({(selectedTask.comments || []).length})
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-2 mb-3">
                {(selectedTask.comments || []).length === 0 ? (
                  <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-lg">
                    No comments or updates yet.
                  </p>
                ) : (
                  selectedTask.comments.map((c: any, i) => (
                    <div
                      key={c._id || i}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">
                          {c.author?.name || "Staff Member"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type an update or comment..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 text-xs"
                />
                <button
                  type="submit"
                  disabled={formLoading || !newComment.trim()}
                  className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1 font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Task Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete task: "${selectedTask?.title}"?`}
        confirmText="Delete Task"
        isLoading={formLoading}
      />
    </div>
  );
};

export default TaskManagement;
