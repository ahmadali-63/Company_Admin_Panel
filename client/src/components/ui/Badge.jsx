import React from "react";

export const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: "bg-[#845EC2]/20 text-[#d8b4fe] border-[#845EC2]/40 shadow-sm",
    hr: "bg-[#2C73D2]/20 text-[#93c5fd] border-[#2C73D2]/40 shadow-sm",
    team_lead: "bg-[#0081CF]/20 text-[#7dd3fc] border-[#0081CF]/40 shadow-sm",
    team_member: "bg-[#008F7A]/20 text-[#6ee7b7] border-[#008F7A]/40 shadow-sm",
  };

  const roleNames = {
    admin: "Admin",
    hr: "HR",
    team_lead: "Team Lead",
    team_member: "Team Member",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
        roleStyles[role] || "bg-slate-800 text-slate-200 border-slate-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          role === "admin"
            ? "bg-[#845EC2]"
            : role === "hr"
            ? "bg-[#2C73D2]"
            : role === "team_lead"
            ? "bg-[#0081CF]"
            : "bg-[#008F7A]"
        }`}
      />
      {roleNames[role] || role}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: "bg-[#008F7A]/20 text-[#6ee7b7] border-[#008F7A]/40",
    planning: "bg-[#845EC2]/20 text-[#d8b4fe] border-[#845EC2]/40",
    on_hold: "bg-[#0089BA]/20 text-[#7dd3fc] border-[#0089BA]/40",
    completed: "bg-[#2C73D2]/20 text-[#93c5fd] border-[#2C73D2]/40",
    cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/40",

    pending: "bg-[#845EC2]/20 text-[#d8b4fe] border-[#845EC2]/40",
    in_progress: "bg-[#0081CF]/20 text-[#7dd3fc] border-[#0081CF]/40",

    true: "bg-[#008F7A]/20 text-[#6ee7b7] border-[#008F7A]/40",
    false: "bg-rose-500/20 text-rose-300 border-rose-500/40",
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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${
        statusStyles[status] || "bg-slate-800 text-slate-200 border-slate-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "active" || status === true
            ? "bg-[#008F7A] animate-pulse"
            : status === "completed"
            ? "bg-[#2C73D2]"
            : status === "in_progress"
            ? "bg-[#0081CF]"
            : status === "pending" || status === "planning"
            ? "bg-[#845EC2]"
            : "bg-rose-400"
        }`}
      />
      {statusLabels[status] || status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    low: "bg-slate-800/80 text-slate-300 border-slate-700",
    medium: "bg-[#2C73D2]/20 text-[#93c5fd] border-[#2C73D2]/40",
    high: "bg-[#845EC2]/20 text-[#d8b4fe] border-[#845EC2]/40",
    urgent: "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border capitalize shadow-sm ${
        styles[priority] || "bg-slate-800 text-slate-200 border-slate-700"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          priority === "urgent"
            ? "bg-rose-400 animate-ping"
            : priority === "high"
            ? "bg-[#845EC2]"
            : priority === "medium"
            ? "bg-[#2C73D2]"
            : "bg-slate-400"
        }`}
      />
      {priority}
    </span>
  );
};
