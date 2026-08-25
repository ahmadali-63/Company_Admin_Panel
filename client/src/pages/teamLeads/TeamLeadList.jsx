import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge, RoleBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { UserHoverCard } from "../../components/ui/HoverPreviewCard";
import {
  UserCog,
  Eye,
  Search,
  Briefcase,
  FolderKanban,
  Users,
  Mail,
  Shield,
} from "lucide-react";

const TeamLeadList = () => {
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTeamLeads = async () => {
      try {
        setLoading(true);
        const res = await API.get("/users?role=team_lead");
        if (res.data.success) {
          setTeamLeads(res.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch Team Leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeamLeads();
  }, []);

  const filtered = teamLeads.filter(
    (tl) =>
      tl.name.toLowerCase().includes(search.toLowerCase()) ||
      tl.email.toLowerCase().includes(search.toLowerCase()) ||
      (tl.department && tl.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserCog className="w-6 h-6 text-emerald-400" />
            Team Leads Workspace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Technical and operational team leads managing team members and project execution
          </p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-3xl border border-slate-800/90 shadow-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Team Leads by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No Team Leads found"
          description="There are currently no users registered as Team Leads matching your search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tl) => {
            const initials = tl.name
              ? tl.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "TL";

            return (
              <div
                key={tl._id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/90 shadow-xl space-y-4 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <UserHoverCard user={tl}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-base group-hover:text-emerald-300 transition-colors truncate">
                            {tl.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {tl.email}
                          </p>
                        </div>
                      </div>
                    </UserHoverCard>
                    <StatusBadge status={tl.isActive ? "true" : "false"} />
                  </div>

                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <RoleBadge role="team_lead" />
                    {tl.department && (
                      <span className="px-2.5 py-1 rounded-full bg-[#845EC2]/15 border border-[#845EC2]/35 text-[11px] font-bold text-[#d8b4fe] flex items-center gap-1 shadow-sm">
                        <Briefcase className="w-3 h-3 text-[#c084fc]" />
                        {tl.department}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0a1024]/90 border border-white/10 space-y-2 text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-[#7dd3fc]" /> HR Supervisor
                      </span>
                      <span className="font-extrabold text-[#7dd3fc]">
                        {tl.hrId?.name || "Unassigned"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-300 font-bold text-[11px] flex items-center gap-1">
                        <FolderKanban className="w-3.5 h-3.5 text-[#d8b4fe]" /> Projects
                      </span>
                      <span className="font-extrabold text-[#d8b4fe]">{tl.projectIds?.length || 0} Assigned</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <Link
                    to={`/team-leads/${tl._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:bg-emerald-600"
                  >
                    <Eye className="w-4 h-4" />
                    View Team Lead Profile
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

export default TeamLeadList;
