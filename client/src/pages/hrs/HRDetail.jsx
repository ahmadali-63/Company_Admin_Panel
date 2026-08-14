import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge, RoleBadge } from "../../components/ui/Badge";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ArrowLeft, Mail, Phone, Building, UserCheck, FolderKanban, Users } from "lucide-react";

const HRDetail = () => {
  const { id } = useParams();
  const [hr, setHr] = useState(null);
  const [teamLeads, setTeamLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHRDetails = async () => {
      try {
        setLoading(true);
        const hrRes = await API.get(`/users/${id}`);
        if (hrRes.data.success) {
          setHr(hrRes.data.user);
        }

        const tlRes = await API.get(`/users?role=team_lead`);
        if (tlRes.data.success) {
          setTeamLeads(tlRes.data.users.filter((u) => u.hrId?._id === id || u.hrId === id));
        }

        const tmRes = await API.get(`/users?role=team_member`);
        if (tmRes.data.success) {
          setTeamMembers(tmRes.data.users.filter((u) => u.hrId?._id === id || u.hrId === id));
        }
      } catch (err) {
        console.error("HR Detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHRDetails();
  }, [id]);

  if (loading) return <TableSkeleton rows={4} cols={2} />;

  if (!hr) {
    return (
      <div className="p-6 text-center glass-panel">
        <p className="text-rose-400 font-semibold">HR Manager not found.</p>
        <Link to="/hrs" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to HR List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Link to="/hrs" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-white">{hr.name}</h1>
          <p className="text-xs text-slate-400">HR Manager Profile & Assigned Teams</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 font-bold text-xl flex items-center justify-center border border-blue-500/30">
              {hr.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-slate-100">{hr.name}</h2>
              <StatusBadge status={hr.isActive ? "true" : "false"} />
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>{hr.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              <span>{hr.phone || "No phone listed"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>{hr.department || "Human Resources"}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Team Leads */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Assigned Team Leads ({teamLeads.length})
            </h3>
            {teamLeads.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamLeads.map((tl) => (
                  <Link
                    key={tl._id}
                    to={`/team-leads/${tl._id}`}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 block text-xs"
                  >
                    <p className="font-bold text-slate-200">{tl.name}</p>
                    <p className="text-[10px] text-slate-400">{tl.email}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No Team Leads assigned to this HR yet.</p>
            )}
          </div>

          {/* Assigned Team Members */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Assigned Team Members ({teamMembers.length})
            </h3>
            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teamMembers.map((tm) => (
                  <Link
                    key={tm._id}
                    to={`/team-members/${tm._id}`}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 block text-xs"
                  >
                    <p className="font-bold text-slate-200">{tm.name}</p>
                    <p className="text-[10px] text-slate-400">{tm.email}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No Team Members assigned under this HR.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDetail;
