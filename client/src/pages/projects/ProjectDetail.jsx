import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  ArrowLeft,
  Calendar,
  UserCheck,
  UserCog,
  UserCheck2,
  CheckSquare,
  Plus,
  Trash2,
  FolderKanban,
  FileText,
} from "lucide-react";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Assignment Modal States
  const [assignModal, setAssignModal] = useState({ open: false, type: "" }); // 'hr', 'team_lead', 'member'
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.project);
      }

      const taskRes = await API.get(`/tasks?projectId=${id}`);
      if (taskRes.data.success) {
        setTasks(taskRes.data.tasks);
      }
    } catch (err) {
      console.error("Fetch project detail error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleOpenAssignModal = async (type) => {
    setAssignModal({ open: true, type });
    setSelectedUserId("");
    setAssignError("");

    try {
      let roleToFetch = "hr";
      if (type === "team_lead") roleToFetch = "team_lead";
      if (type === "member") roleToFetch = "team_member";

      const res = await API.get(`/users?role=${roleToFetch}&isActive=true`);
      if (res.data.success) {
        setAvailableUsers(res.data.users);
      }
    } catch (err) {
      console.error("Fetch available users error:", err);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignError("");

    if (!selectedUserId) {
      setAssignError("Please select a user to assign.");
      return;
    }

    try {
      setAssignLoading(true);
      if (assignModal.type === "hr") {
        await API.post(`/projects/${id}/hr`, { hrId: selectedUserId });
      } else if (assignModal.type === "team_lead") {
        await API.post(`/projects/${id}/team-leads`, { teamLeadId: selectedUserId });
      } else if (assignModal.type === "member") {
        await API.post(`/projects/${id}/members`, { memberId: selectedUserId });
      }

      setAssignModal({ open: false, type: "" });
      fetchProjectData();
    } catch (err) {
      setAssignError(err.response?.data?.message || "Assignment failed.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRemoveAssignment = async (type, userId) => {
    if (!window.confirm("Remove this user from the project?")) return;

    try {
      if (type === "hr") {
        await API.delete(`/projects/${id}/hr`, { data: { hrId: userId } });
      } else if (type === "team_lead") {
        await API.delete(`/projects/${id}/team-leads`, { data: { teamLeadId: userId } });
      } else if (type === "member") {
        await API.delete(`/projects/${id}/members`, { data: { memberId: userId } });
      }
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || "Removal failed.");
    }
  };

  if (loading) return <TableSkeleton rows={5} cols={2} />;

  if (!project) {
    return (
      <div className="p-6 text-center glass-panel">
        <p className="text-rose-400 font-semibold">Project not found.</p>
        <Link to="/projects" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Projects
        </Link>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const isHR = user?.role === "hr";
  const isTL = user?.role === "team_lead";

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-white">{project.name}</h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {project.code}
              </span>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{project.description || "No project description provided."}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "overview"
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("hrs")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "hrs"
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          HR Managers ({project.hrIds?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("team_leads")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "team_leads"
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Team Leads ({project.teamLeadIds?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("members")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "members"
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Team Members ({project.memberIds?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "tasks"
              ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Project Tasks ({tasks.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Project Timeline & Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Start Date</p>
                  <p className="font-bold">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not Set"}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">End Date</p>
                  <p className="font-bold">{project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not Set"}</p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs font-bold text-slate-300 mb-1">Created By:</p>
              <p className="text-xs text-slate-400">{project.createdBy?.name} ({project.createdBy?.email})</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Resource Summary</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">HR Managers</span>
                <span className="font-bold text-blue-400">{project.hrIds?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Team Leads</span>
                <span className="font-bold text-emerald-400">{project.teamLeadIds?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Team Members</span>
                <span className="font-bold text-purple-400">{project.memberIds?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Total Tasks</span>
                <span className="font-bold text-amber-400">{tasks.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: HR Managers */}
      {activeTab === "hrs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Assigned HR Managers</h3>
            {isAdmin && (
              <button
                onClick={() => handleOpenAssignModal("hr")}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Assign HR
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.hrIds?.map((hr) => (
              <div key={hr._id} className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-200">{hr.name}</p>
                  <p className="text-[10px] text-slate-400">{hr.email}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveAssignment("hr", hr._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Remove HR"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Team Leads */}
      {activeTab === "team_leads" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Assigned Team Leads</h3>
            {(isAdmin || isHR) && (
              <button
                onClick={() => handleOpenAssignModal("team_lead")}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Assign Team Lead
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.teamLeadIds?.map((tl) => (
              <div key={tl._id} className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-200">{tl.name}</p>
                  <p className="text-[10px] text-slate-400">{tl.email}</p>
                </div>
                {(isAdmin || isHR) && (
                  <button
                    onClick={() => handleRemoveAssignment("team_lead", tl._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Remove Team Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Team Members */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Assigned Team Members</h3>
            {(isAdmin || isHR || isTL) && (
              <button
                onClick={() => handleOpenAssignModal("member")}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Assign Member
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.memberIds?.map((m) => (
              <div key={m._id} className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-200">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.email}</p>
                </div>
                {(isAdmin || isHR || isTL) && (
                  <button
                    onClick={() => handleRemoveAssignment("member", m._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Project Tasks</h3>
            <Link
              to="/tasks"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Manage Tasks
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.map((t) => (
              <div key={t._id} className="p-4 rounded-2xl glass-card border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-200">{t.title}</p>
                  <p className="text-[10px] text-slate-400">Assigned To: {t.assignedTo?.name || "Unassigned"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      <Modal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, type: "" })}
        title={`Assign ${assignModal.type.replace("_", " ").toUpperCase()} to Project`}
      >
        {assignError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {assignError}
          </div>
        )}

        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Select Employee *</label>
            <select
              required
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select User...</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAssignModal({ open: false, type: "" })}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignLoading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
            >
              {assignLoading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              Assign to Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
