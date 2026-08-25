import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge, RoleBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { UserHoverCard } from "../../components/ui/HoverPreviewCard";
import {
  UserCheck,
  Eye,
  Search,
  Briefcase,
  Users,
  FolderKanban,
  Mail,
  Shield,
} from "lucide-react";

const HRList = () => {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchHRs = async () => {
      try {
        setLoading(true);
        const res = await API.get("/users?role=hr");
        if (res.data.success) {
          setHrs(res.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch HR list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHRs();
  }, []);

  const filteredHrs = hrs.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.email.toLowerCase().includes(search.toLowerCase()) ||
      (h.department && h.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-400" />
            Human Resources Managers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of HR supervisors managing team leads, projects, and organizational departments
          </p>
        </div>
      </div>

      <div className="glass-panel p-3.5 md:p-4 rounded-3xl border border-white/15 shadow-2xl bg-[#0a0f26]/85 backdrop-blur-2xl">
        <div className="relative w-full group">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#c084fc] group-focus-within:text-[#7dd3fc] transition-colors" />
          <input
            type="text"
            placeholder="Search HR managers by name, email, or department..."
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
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filteredHrs.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No HR Managers found"
          description="There are currently no users with the HR role matching your search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHrs.map((h) => {
            const initials = h.name
              ? h.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "HR";

            return (
              <div
                key={h._id}
                className="glass-card glass-card-hover rounded-3xl p-6 border border-slate-800/90 shadow-xl space-y-4 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <UserHoverCard user={h}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-base group-hover:text-blue-300 transition-colors truncate">
                            {h.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {h.email}
                          </p>
                        </div>
                      </div>
                    </UserHoverCard>
                    <StatusBadge status={h.isActive ? "true" : "false"} />
                  </div>

                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <RoleBadge role="hr" />
                    {h.department && (
                      <span className="px-2.5 py-1 rounded-full bg-[#845EC2]/15 border border-[#845EC2]/35 text-[11px] font-bold text-[#d8b4fe] flex items-center gap-1 shadow-sm">
                        <Briefcase className="w-3 h-3 text-[#c084fc]" />
                        {h.department}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#0a1024]/90 border border-white/10 grid grid-cols-2 gap-2 text-xs text-slate-200 shadow-inner">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="w-3.5 h-3.5 text-[#7dd3fc]" />
                      <span className="font-extrabold text-[#7dd3fc]">{h.projectIds?.length || 0} Projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#d8b4fe]" />
                      <span className="truncate font-extrabold text-[#d8b4fe]">{h.designation || "Senior HR"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <Link
                    to={`/hrs/${h._id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group-hover:bg-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                    View HR Profile & Reports
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

export default HRList;
