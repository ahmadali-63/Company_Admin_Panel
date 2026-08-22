import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge } from "../../components/ui/Badge";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ArrowLeft, Mail, Phone, Building, UserCog, Users, FolderKanban } from "lucide-react";

const TeamLeadDetail = () => {
  const { id } = useParams();
  const [tl, setTl] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTLDetails = async () => {
      try {
        setLoading(true);
        const tlRes = await API.get(`/users/${id}`);
        if (tlRes.data.success) {
          setTl(tlRes.data.user);
        }

        const tmRes = await API.get(`/users?role=team_member`);
        if (tmRes.data.success) {
          setMembers(tmRes.data.users.filter((m) => m.teamLeadId?._id === id || m.teamLeadId === id));
        }
      } catch (err) {
        console.error("Fetch TL Detail error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTLDetails();
  }, [id]);

  if (loading) return <TableSkeleton rows={4} cols={2} />;

  if (!tl) {
    return (
      <div className="p-6 text-center glass-panel">
        <p className="text-rose-400 font-semibold">Team Lead not found.</p>
        <Link to="/team-leads" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Team Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Link to="/team-leads" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">{tl.name}</h1>
          <p className="text-xs text-slate-400">Team Lead Profile & Assigned Team Members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 font-bold text-xl flex items-center justify-center border border-emerald-500/30">
              {tl.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-100">{tl.name}</h2>
              <StatusBadge status={tl.isActive ? "true" : "false"} />
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>{tl.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{tl.phone || "No phone listed"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>HR Manager: {tl.hrId?.name || "Unassigned"}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Assigned Team Members ({members.length})
            </h3>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((m) => (
                  <Link
                    key={m._id}
                    to={`/team-members/${m._id}`}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 block text-xs"
                  >
                    <p className="font-bold text-slate-200">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.email}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No Team Members currently assigned to this Team Lead.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeadDetail;
