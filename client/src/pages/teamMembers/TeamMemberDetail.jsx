import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge, PriorityBadge } from "../../components/ui/Badge";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ArrowLeft, Mail, Phone, Building, UserCheck2, CheckSquare, FolderKanban } from "lucide-react";

const TeamMemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDetail = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${id}`);
        if (res.data.success) {
          setMember(res.data.user);
        }

        const taskRes = await API.get(`/tasks?assignedTo=${id}`);
        if (taskRes.data.success) {
          setTasks(taskRes.data.tasks);
        }
      } catch (err) {
        console.error("Fetch Member Detail error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberDetail();
  }, [id]);

  if (loading) return <TableSkeleton rows={4} cols={2} />;

  if (!member) {
    return (
      <div className="p-6 text-center glass-panel">
        <p className="text-rose-400 font-semibold">Team Member not found.</p>
        <Link to="/team-members" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Team Members
        </Link>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Link to="/team-members" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">{member.name}</h1>
          <p className="text-xs text-slate-400">Team Member Profile & Assigned Tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold text-xl flex items-center justify-center border border-indigo-500/30">
              {member.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-100">{member.name}</h2>
              <StatusBadge status={member.isActive ? "true" : "false"} />
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-400" />
              <span>{member.phone || "No phone listed"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Team Lead: {member.teamLeadId?.name || "Unassigned"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>HR Manager: {member.hrId?.name || "Unassigned"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-lg font-bold text-emerald-400">{completedTasks}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Completed</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <p className="text-lg font-bold text-amber-400">{pendingTasks}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Pending</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              Assigned Tasks ({tasks.length})
            </h3>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div key={t._id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{t.title}</p>
                      <p className="text-[10px] text-slate-400">Project: {t.projectId?.name || "General"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No tasks currently assigned to this member.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMemberDetail;
