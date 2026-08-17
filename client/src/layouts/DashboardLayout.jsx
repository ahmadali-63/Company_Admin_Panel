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
  Building2,
  Bell,
  Clock,
  FileText,
} from "lucide-react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

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
      label: "Users",
      path: "/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      label: "HRs",
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

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 glass-panel border-r border-slate-800/80 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
              Nexus<span className="text-indigo-400">Admin</span>
            </h1>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              Company Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Card Sidebar Bottom */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <div className="mt-0.5">
                <RoleBadge role={user?.role} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-base text-white">NexusAdmin</h1>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 glass-panel border-b border-slate-800/80 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-slate-200 capitalize">
                {location.pathname.split("/")[1] || "Dashboard"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Icon (Visual UI) */}
            <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-200">{user?.name}</p>
                  <p className="text-[10px] text-slate-400">{user?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 glass-panel bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in duration-150"
                  onClick={() => setUserDropdown(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-slate-200">{user?.name}</p>
                    <p className="text-[10px] text-slate-400">{user?.email}</p>
                    <div className="mt-1.5">
                      <RoleBadge role={user?.role} />
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
