import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral"
    | "primary"
    | "purple";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const variantStyles: Record<string, string> = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-cyan-50 text-cyan-700 border-cyan-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    neutral: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const sizeStyles: Record<string, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-medium",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string; size?: "sm" | "md" | "lg" }> = ({
  status,
  size = "md",
}) => {
  const normalized = (status || "").toLowerCase().replace(/\s+/g, "_");

  switch (normalized) {
    case "present":
    case "active":
    case "completed":
    case "approved":
      return (
        <Badge variant="success" size={size}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {status}
        </Badge>
      );
    case "pending":
    case "planning":
      return (
        <Badge variant="warning" size={size}>
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {status}
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="primary" size={size}>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          In Progress
        </Badge>
      );
    case "late":
    case "half_day":
      return (
        <Badge variant="warning" size={size}>
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
          {status}
        </Badge>
      );
    case "overdue":
    case "absent":
    case "rejected":
    case "cancelled":
      return (
        <Badge variant="danger" size={size}>
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {status}
        </Badge>
      );
    case "checked_out":
      return (
        <Badge variant="info" size={size}>
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          Checked Out
        </Badge>
      );
    case "on_leave":
      return (
        <Badge variant="purple" size={size}>
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          On Leave
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size}>
          {status}
        </Badge>
      );
  }
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const p = (priority || "").toLowerCase();
  switch (p) {
    case "urgent":
      return <Badge variant="danger" size="sm">🔥 Urgent</Badge>;
    case "high":
      return <Badge variant="warning" size="sm">⚡ High</Badge>;
    case "medium":
      return <Badge variant="primary" size="sm">Medium</Badge>;
    case "low":
      return <Badge variant="neutral" size="sm">Low</Badge>;
    default:
      return <Badge variant="neutral" size="sm">{priority}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const r = (role || "").toLowerCase();
  switch (r) {
    case "admin":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
          👑 Admin
        </span>
      );
    case "hr":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          💼 HR
        </span>
      );
    case "employee":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          💻 Employee
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-800">
          {role}
        </span>
      );
  }
};
