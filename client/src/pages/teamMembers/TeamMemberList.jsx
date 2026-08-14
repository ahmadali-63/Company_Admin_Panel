import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { UserCheck2, Eye, Search, Briefcase } from "lucide-react";

const TeamMemberList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await API.get("/users?role=team_member");
        if (res.data.success) {
          setMembers(res.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch Team Members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Team Members</h1>
          <p className="text-xs text-slate-400">View team members and reporting structures</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Team Members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCheck2}
          title="No Team Members found"
          description="There are currently no users registered as Team Members."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => (
            <div key={m._id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 hover:border-indigo-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-lg flex items-center justify-center">
                  {m.name?.[0]?.toUpperCase()}
                </div>
                <StatusBadge status={m.isActive ? "true" : "false"} />
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-base">{m.name}</h3>
                <p className="text-xs text-slate-400">{m.email}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-300">
                <p className="text-[11px] text-slate-400">
                  TL: <span className="font-semibold text-emerald-400">{m.teamLeadId?.name || "Unassigned"}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  HR: <span className="font-semibold text-blue-400">{m.hrId?.name || "Unassigned"}</span>
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/team-members/${m._id}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                  View Member Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMemberList;
