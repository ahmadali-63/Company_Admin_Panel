import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge, RoleBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { UserHoverCard } from "../../components/ui/HoverPreviewCard";
import {
  UserCheck2,
  Eye,
  Search,
  Briefcase,
  User,
  Shield,
  Mail,
  Layers,
} from "lucide-react";

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
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck2 className="w-6 h-6 text-purple-400" />
            Team Members Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Operational personnel, engineering staff, and department members
          </p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-3xl border border-slate-800/90 shadow-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Team Members by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCheck2}
          title="No Team Members found"
          description="There are currently no users registered as Team Members matching your search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((m) => {
            const initials = m.name
              ? m.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "TM";

            return (
              <div
                key={m._id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/90 shadow-xl space-y-4 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <UserHoverCard user={m}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-base group-hover:text-purple-300 transition-colors truncate">
                            {m.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </UserHoverCard>
                    <StatusBadge status={m.isActive ? "true" : "false"} />
                  </div>

                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <RoleBadge role="team_member" />
                    {m.department && (
                      <span className="px-2.5 py-1 rounded-full bg-[#845EC2]/15 border border-[#845EC2]/35 text-[11px] font-bold text-[#d8b4fe] flex items-center gap-1 shadow-sm">
                        <Briefcase className="w-3 h-3 text-[#c084fc]" />
                        {m.department}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0a1024]/90 border border-white/10 space-y-2 text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#6ee7b7]" /> Team Lead
                      </span>
                      <span className="font-extrabold text-[#6ee7b7] truncate max-w-[140px]">
                        {m.teamLeadId?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-[#7dd3fc]" /> HR Supervisor
                      </span>
                      <span className="font-extrabold text-[#7dd3fc] truncate max-w-[140px]">
                        {m.hrId?.name || "Inherited from Lead"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <Link
                    to={`/team-members/${m._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-purple-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:bg-purple-600"
                  >
                    <Eye className="w-4 h-4" />
                    View Member Profile
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamMemberList;
