import React, { useState, useRef } from "react";
import { RoleBadge, StatusBadge, PriorityBadge } from "./Badge";
import {
  Mail,
  Phone,
  Briefcase,
  Layers,
  Shield,
  User,
  Calendar,
  FolderKanban,
  CheckSquare,
  ArrowUpRight,
} from "lucide-react";

/**
 * UserHoverCard: Displays a floating preview card when hovering over a user element
 */
export const UserHoverCard = ({ user, children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  if (!user) return <>{children}</>;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isOpen && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4 rounded-2xl glass-panel bg-slate-900/95 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
          style={{ backdropFilter: "blur(20px)" }}
        >
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 shrink-0 text-slate-500" />
                {user.email}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                <RoleBadge role={user.role} />
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.isActive !== false ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
            {user.department && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Dept
                </span>
                <span className="font-semibold">{user.department}</span>
              </div>
            )}
            {user.designation && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Role Title
                </span>
                <span className="font-semibold">{user.designation}</span>
              </div>
            )}
            {user.hrId && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> HR Supervisor
                </span>
                <span className="font-semibold text-indigo-300">
                  {typeof user.hrId === "object" ? user.hrId.name : "Assigned"}
                </span>
              </div>
            )}
            {user.teamLeadId && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" /> Team Lead
                </span>
                <span className="font-semibold text-emerald-300">
                  {typeof user.teamLeadId === "object" ? user.teamLeadId.name : "Assigned"}
                </span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </span>
                <span className="font-semibold">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};

/**
 * ProjectHoverCard: Floating preview for projects
 */
export const ProjectHoverCard = ({ project, children, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  if (!project) return <>{children}</>;

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(true), 150);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isOpen && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-4 rounded-2xl glass-panel bg-slate-900/95 border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto"
          style={{ backdropFilter: "blur(20px)" }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold border border-indigo-500/20">
                {project.code || "PRJ"}
              </span>
              <h4 className="text-sm font-bold text-white mt-1">{project.name}</h4>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {project.description && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Members</span>
              <span className="text-xs font-bold text-slate-200">
                {project.memberIds?.length || 0} Team Members
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Timeline</span>
              <span className="text-xs font-bold text-slate-200">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  : "Active"}
              </span>
            </div>
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};
