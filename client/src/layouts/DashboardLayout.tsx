import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Briefcase,
  CheckSquare,
  Clock,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { RoleBadge } from "../components/ui/Badge";

export const DashboardLayout: React.FC = () => {
  const { user, logout, isAdmin, isHR, isEmployee } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);
  const [time, setTime] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const adminNav = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Employees", path: "/admin/employees", icon: Users },
    { name: "HR Management", path: "/admin/hr", icon: UserCheck },
    { name: "Projects", path: "/admin/projects", icon: Briefcase },
    { name: "Tasks", path: "/admin/tasks", icon: CheckSquare },
    { name: "Attendance", path: "/admin/attendance", icon: Clock },
    { name: "Leave Management", path: "/admin/leave", icon: CalendarDays },
    { name: "Reports", path: "/admin/reports", icon: BarChart3 },
    { name: "Notifications", path: "/admin/notifications", icon: Bell },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const hrNav = [
    { name: "Dashboard", path: "/hr/dashboard", icon: LayoutDashboard },
    { name: "My Employees", path: "/hr/employees", icon: Users },
    { name: "Tasks", path: "/hr/tasks", icon: CheckSquare },
    { name: "Projects", path: "/hr/projects", icon: Briefcase },
    { name: "Attendance", path: "/hr/attendance", icon: Clock },
    { name: "Leave Requests", path: "/hr/leave", icon: CalendarDays },
    { name: "Notifications", path: "/hr/notifications", icon: Bell },
    { name: "My Profile", path: "/hr/profile", icon: UserIcon },
  ];

  const employeeNav = [
    { name: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
    { name: "My Tasks", path: "/employee/tasks", icon: CheckSquare },
    { name: "My Projects", path: "/employee/projects", icon: Briefcase },
    { name: "Attendance", path: "/employee/attendance", icon: Clock },
    { name: "Leave", path: "/employee/leave", icon: CalendarDays },
    { name: "Notifications", path: "/employee/notifications", icon: Bell },
    { name: "My Profile", path: "/employee/profile", icon: UserIcon },
  ];

  const navItems = isAdmin ? adminNav : isHR ? hrNav : employeeNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col lg:flex-row antialiased">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 z-50 h-screen w-72 bg-slate-900 text-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 border-r border-slate-800 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Company Brand Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  CorpAdmin <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-normal">SaaS</span>
                </h1>
                <p className="text-[11px] text-slate-400">Enterprise Workspace</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Compact Card */}
          <div className="mx-4 my-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <img
              src={
                user?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.name || "User",
                )}&background=4f46e5&color=fff`
              }
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/40"
            />
            <div className="overflow-hidden flex-1">
              <h4 className="text-xs font-semibold text-white truncate">
                {user?.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.designation || user?.department || user?.email}
              </p>
              <div className="mt-1">
                <RoleBadge role={user?.role || "employee"} />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-2 space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {isAdmin ? "Admin Controls" : isHR ? "HR Portal" : "Employee Portal"}
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/90">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs backdrop-blur-md">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Mobile Toggle & Path Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden sm:block">
                <span className="text-xs font-medium text-slate-400">
                  Company Management System /
                </span>
                <span className="text-xs font-bold text-slate-800 ml-1 capitalize">
                  {location.pathname.split("/")[2] || "Dashboard"}
                </span>
              </div>
            </div>

            {/* Right-Side Tools & User Menu */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Live Clock */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{time}</span>
              </div>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllAsRead()}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 py-6 text-center">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            onClick={() => !n.isRead && markAsRead(n._id)}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              n.isRead
                                ? "bg-slate-50 border-slate-100 text-slate-600"
                                : "bg-blue-50/70 border-blue-100 text-slate-800 font-medium"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-600 leading-snug">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 mt-2 text-center">
                      <Link
                        to={`/${user?.role}/notifications`}
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <img
                    src={
                      user?.profileImage ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || "User",
                      )}&background=4f46e5&color=fff`
                    }
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-semibold text-slate-800">
                      {user?.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">
                        {user?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {user?.email}
                      </p>
                      <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                        ID: {user?.employeeId}
                      </p>
                    </div>

                    <Link
                      to={isAdmin ? "/admin/settings" : `/${user?.role}/profile`}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-medium text-left border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
