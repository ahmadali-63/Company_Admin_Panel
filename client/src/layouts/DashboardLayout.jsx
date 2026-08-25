import React, { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { RoleBadge } from "../components/ui/Badge";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  UserCheck2,
  FolderKanban,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Clock,
  FileText,
  Search,
  Sparkles,
  Shield,
  ExternalLink,
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "hr", "team_lead", "team_member"],
    },
    {
      label: "All Users",
      path: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      label: "HR Managers",
      path: "/hrs",
      icon: UserCheck,
      roles: ["admin", "hr"],
    },
    {
      label: "Team Leads",
      path: "/team-leads",
      icon: UserCog,
      roles: ["admin", "hr", "team_lead"],
    },
    {
      label: "Team Members",
      path: "/team-members",
      icon: UserCheck2,
      roles: ["admin", "hr", "team_lead"],
    },
    {
      label: "Projects",
      path: "/projects",
      icon: FolderKanban,
      roles: ["admin", "hr", "team_lead", "team_member"],
    },
    {
      label: "Tasks",
      path: "/tasks",
      icon: CheckSquare,
      roles: ["admin", "hr", "team_lead", "team_member"],
    },
    {
      label: "Attendance",
      path: "/attendance",
      icon: Clock,
      roles: ["admin", "hr", "team_lead", "team_member"],
    },
    {
      label: "Leaves",
      path: "/leaves",
      icon: FileText,
      roles: ["admin", "hr", "team_lead", "team_member"],
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
      roles: ["admin", "hr", "team_lead", "team_member"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const mockNotifications = [
    {
      id: 1,
      title: "New Team Member assigned",
      desc: "M Mahad joined the Skill development group",
      time: "10m ago",
      dot: "bg-indigo-400",
    },
    {
      id: 2,
      title: "Project Milestone reached",
      desc: "Web Development QTP status updated to Active",
      time: "1h ago",
      dot: "bg-emerald-400",
    },
    {
      id: 3,
      title: "Task Assigned",
      desc: "API authentication endpoints audit",
      time: "3h ago",
      dot: "bg-purple-400",
    },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen flex text-slate-100 font-sans selection:bg-[#845EC2] selection:text-white bg-transparent">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel bg-slate-950/70 border-r border-white/10 sticky top-0 h-screen z-30 shadow-2xl backdrop-blur-2xl">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#845EC2]/20 via-slate-950/40 to-transparent">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl gradient-palette-bg text-white shadow-lg shadow-[#0081CF]/30 flex items-center justify-center text-sm font-extrabold tracking-tight transition-transform group-hover:scale-105 border border-white/20">
              NA
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1 leading-none">
                Nexus<span className="text-gradient-accent">Admin</span>
              </h1>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Enterprise Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Navigation Menu
          </p>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group ${
                  isActive
                    ? "gradient-palette-bg text-white shadow-lg shadow-[#0081CF]/30 border border-white/20"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-[#0081CF]"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Card Bottom */}
        <div className="p-3.5 border-t border-white/10 bg-[#080518]/90">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0e1632]/95 border border-[#845EC2]/40 hover:border-[#845EC2]/70 transition-colors shadow-lg shadow-black/50">
            <div className="w-10 h-10 rounded-xl gradient-palette-bg text-white font-extrabold text-sm flex items-center justify-center shadow-md shrink-0 border border-white/20">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-extrabold text-white truncate">{user?.name}</p>
              <div className="mt-1">
                <RoleBadge role={user?.role} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel bg-slate-950/95 border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-palette-bg text-white flex items-center justify-center text-sm font-extrabold tracking-tight">
              NA
            </div>
            <h1 className="font-extrabold text-base text-white">NexusAdmin</h1>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3.5 py-5 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? "gradient-palette-bg text-white shadow-lg shadow-[#0081CF]/30 border border-white/20"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 glass-panel bg-slate-950/60 border-b border-white/10 sticky top-0 z-20 flex items-center justify-between backdrop-blur-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="capitalize text-white font-extrabold text-sm tracking-tight">
                {location.pathname.split("/")[1]?.replace("-", " ") || "Dashboard"}
              </span>
              <span className="text-slate-500 font-bold">/</span>
              <span className="text-slate-300 font-semibold">Workspace Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdown(!notifDropdown);
                  setUserDropdown(false);
                }}
                className="p-2.5 rounded-2xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0081CF] ring-2 ring-slate-950 animate-pulse"></span>
              </button>

              {notifDropdown && (
                <div
                  className="absolute right-0 mt-3 w-80 glass-panel bg-slate-950/95 border border-slate-800/90 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setNotifDropdown(false)}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Notifications
                    </h4>
                    <span className="text-[10px] font-bold text-[#0081CF] bg-[#0081CF]/15 px-2.5 py-0.5 rounded-full border border-[#0081CF]/30">
                      3 New
                    </span>
                  </div>

                  <div className="divide-y divide-slate-800/60 mt-1">
                    {mockNotifications.map((n) => (
                      <div key={n.id} className="py-2.5 first:pt-2 last:pb-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${n.dot}`} />
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 pl-3 leading-snug">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdown(!userDropdown);
                  setNotifDropdown(false);
                }}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-800/80 border border-white/10 hover:border-[#845EC2]/50 transition-all bg-[#0e1632]/95 shadow-md"
              >
                <div className="w-8 h-8 rounded-xl gradient-palette-bg text-white font-extrabold text-xs flex items-center justify-center shadow-md border border-white/20">
                  {userInitials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-extrabold text-white leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-purple-200/80 font-mono truncate max-w-[120px]">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-purple-300" />
              </button>

              {userDropdown && (
                <div
                  className="absolute right-0 mt-3 w-64 glass-panel bg-[#0c1228]/98 border border-white/15 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdown(false)}
                >
                  <div className="p-3 bg-[#131c3c]/90 rounded-2xl border border-white/10 mb-2">
                    <p className="text-xs font-extrabold text-white">{user?.name}</p>
                    <p className="text-[10px] text-purple-200/80 font-mono truncate mt-0.5">
                      {user?.email}
                    </p>
                    <div className="mt-2">
                      <RoleBadge role={user?.role} />
                    </div>
                  </div>

                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
