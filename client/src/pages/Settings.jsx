import React from "react";
import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "../components/ui/Badge";
import { User, Mail, Shield, Building, Phone } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">Account & System Settings</h1>
        <p className="text-xs text-slate-400">View user credentials and security role profiles</p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name}</h2>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <div className="mt-2">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              Email Address
            </span>
            <p className="font-bold text-slate-200">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              Phone
            </span>
            <p className="font-bold text-slate-200">{user?.phone || "Not specified"}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              Department
            </span>
            <p className="font-bold text-slate-200">{user?.department || "Corporate"}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              System Role
            </span>
            <p className="font-bold text-slate-200 capitalize">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
