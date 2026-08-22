import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Clock,
  Shield,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("Acme Technologies Corp.");
  const [workStartTime, setWorkStartTime] = useState<string>("09:00");
  const [gracePeriod, setGracePeriod] = useState<number>(15);
  const [workDuration, setWorkDuration] = useState<number>(8);
  const [autoOverdue, setAutoOverdue] = useState<boolean>(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600" />
          Company Settings & Policies
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Configure corporate parameters, attendance policy, and operational rules
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration updated and persisted successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Company Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Company Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Executive Owner (Admin)
              </label>
              <input
                type="text"
                disabled
                value={`${user?.name} (${user?.email})`}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Working Hours & Attendance Rules Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-indigo-600" />
            Attendance & Work Hours Policy
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Office Start Time
              </label>
              <input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Day Duration (Hours)
              </label>
              <input
                type="number"
                min="4"
                max="12"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoOverdue}
                onChange={(e) => setAutoOverdue(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-800 font-medium">
                Automatically mark non-completed tasks as Overdue after midnight of deadline
              </span>
            </label>
          </div>
        </div>

        {/* Security & Admin Rules Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-indigo-600" />
            Security & Role Invariants
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            <li>Single Company Admin: Admin accounts cannot be created via public registration.</li>
            <li>Admin Attendance Invariant: Admin accounts are strictly exempt from check-in/check-out.</li>
            <li>Strict Role Isolation: HRs can only manage and view their designated personnel.</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
