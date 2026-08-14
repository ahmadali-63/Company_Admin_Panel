import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { StatusBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { UserCheck, Eye, Search, Briefcase, Users, FolderKanban } from "lucide-react";

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
      h.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">HR Managers</h1>
          <p className="text-xs text-slate-400">Manage HR personnel, assigned projects, and team hierarchies</p>
        </div>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search HR managers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filteredHrs.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No HR Managers found"
          description="There are currently no users with the HR role."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHrs.map((h) => (
            <div key={h._id} className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 hover:border-indigo-500/30 transition-all group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-lg flex items-center justify-center">
                  {h.name?.[0]?.toUpperCase()}
                </div>
                <StatusBadge status={h.isActive ? "true" : "false"} />
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-base">{h.name}</h3>
                <p className="text-xs text-slate-400">{h.email}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{h.projectIds?.length || 0} Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate">{h.department || "HR Dept"}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/hrs/${h._id}`}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                  View HR Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HRList;
