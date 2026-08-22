import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../services/api";
import { RoleBadge, StatusBadge } from "../../components/ui/Badge";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  ArrowLeft,
  FolderKanban,
} from "lucide-react";

const UserDetail = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/users/${id}`);
        if (res.data.success) {
          setUserData(res.data.user);
        }
      } catch (err) {
        console.error("Fetch user detail error:", err);
        setError("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id]);

  if (loading) return <TableSkeleton rows={4} cols={2} />;

  if (error || !userData) {
    return (
      <div className="p-6 rounded-2xl glass-panel text-center">
        <p className="text-rose-400 font-semibold">{error || "User not found."}</p>
        <Link to="/users" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Link to="/users" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-100">{userData.name}</h1>
          <p className="text-xs text-slate-400">Employee Details Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 font-extrabold text-2xl flex items-center justify-center border border-indigo-500/30">
              {userData.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{userData.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={userData.role} />
                <StatusBadge status={userData.isActive ? "true" : "false"} />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{userData.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{userData.phone || "No phone number listed"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Department: {userData.department || "General"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Designation: {userData.designation || "Staff"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Joined: {new Date(userData.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Relationships & Hierarchy Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Hierarchy & Reporting</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Assigned HR Manager</p>
                {userData.hrId ? (
                  <div className="mt-2">
                    <p className="font-bold text-slate-200">{userData.hrId.name}</p>
                    <p className="text-[10px] text-slate-400">{userData.hrId.email}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 mt-1">None (Direct HR or Admin)</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Assigned Team Lead</p>
                {userData.teamLeadId ? (
                  <div className="mt-2">
                    <p className="font-bold text-slate-200">{userData.teamLeadId.name}</p>
                    <p className="text-[10px] text-slate-400">{userData.teamLeadId.email}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 mt-1">None</p>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Projects */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-indigo-400" />
              Assigned Projects ({userData.projectIds?.length || 0})
            </h3>
            {userData.projectIds && userData.projectIds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userData.projectIds.map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 block transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xs text-slate-200">{p.name}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-[10px] font-mono text-slate-400 mt-1">[{p.code}]</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No projects currently assigned to this user.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
