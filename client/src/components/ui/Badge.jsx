import React from "react";

export const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    hr: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    team_lead: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    team_member: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  };

  const roleNames = {
    admin: "Admin",
    hr: "HR",
    team_lead: "Team Lead",
    team_member: "Team Member",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        roleStyles[role] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {roleNames[role] || role}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    planning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    on_hold: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",

    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    in_progress: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",

    true: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    false: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const statusLabels = {
    active: "Active",
    planning: "Planning",
    on_hold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
    pending: "Pending",
    in_progress: "In Progress",
    true: "Active",
    false: "Inactive",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        statusStyles[status] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    low: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    medium: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    urgent: "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${
        styles[priority] || "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {priority}
    </span>
  );
};
