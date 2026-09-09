import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { RoleBadge, StatusBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { UserHoverCard } from "../../components/ui/HoverPreviewCard";
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Shield,
  User,
  Sparkles,
} from "lucide-react";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "team_member",
    phone: "",
    department: "",
    designation: "",
    hrId: "",
    teamLeadId: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // HR & Team Lead lists for modal conditional select fields
  const [hrs, setHrs] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);

  // Confirm Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    name: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (searchId) params.searchId = searchId;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter;

      const res = await API.get("/users", { params });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownUsers = async () => {
    try {
      const hrRes = await API.get("/users?role=hr");
      if (hrRes.data.success) setHrs(hrRes.data.users);

      const tlRes = await API.get("/users?role=team_lead");
      if (tlRes.data.success) setTeamLeads(tlRes.data.users);
    } catch (err) {
      console.error("Dropdown fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, searchId, roleFilter, statusFilter]);

  useEffect(() => {
    fetchDropdownUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "team_member",
      phone: "",
      department: "",
      designation: "",
      hrId: "",
      teamLeadId: "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "team_member",
      phone: user.phone || "",
      department: user.department || "",
      designation: user.designation || "",
      hrId: user.hrId?._id || user.hrId || "",
      teamLeadId: user.teamLeadId?._id || user.teamLeadId || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name ||
      !formData.email ||
      (!editingUser && !formData.password)
    ) {
      setFormError("Name, email, and password (for new users) are required.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        if (payload.hrId === "") payload.hrId = null;
        if (payload.teamLeadId === "") payload.teamLeadId = null;
        await API.put(`/users/${editingUser._id}`, payload);
      } else {
        const payload = { ...formData };
        if (payload.hrId === "") payload.hrId = null;
        if (payload.teamLeadId === "") payload.teamLeadId = null;
        await API.post("/users", payload);
      }
      setModalOpen(false);
      fetchUsers();
      fetchDropdownUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await API.patch(`/users/${user._id}/status`, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await API.delete(`/users/${deleteDialog.userId}`);
      setDeleteDialog({ open: false, userId: null, name: "" });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#c084fc]" />
            User Directory
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage organizational staff, roles, supervisor assignments, and operational permissions
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 rounded-2xl btn-purple-glow flex items-center justify-center gap-2 text-xs font-extrabold active:scale-95 group"
        >
          <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
          Add New User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 md:p-4 rounded-3xl border border-white/15 shadow-2xl bg-[#0a0f26]/85 backdrop-blur-2xl flex flex-col md:flex-row items-center gap-3.5">
        <div className="relative flex-1 w-full group">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#c084fc] group-focus-within:text-[#7dd3fc] transition-colors" />
          <input
            type="text"
            placeholder="Search by employee name, email, designation, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 font-medium focus:outline-none focus:border-[#845EC2] focus:ring-4 focus:ring-[#845EC2]/20 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative flex-1 w-full group max-w-[220px]">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#c084fc] group-focus-within:text-[#7dd3fc] transition-colors" />
          <input
            type="text"
            placeholder="Search by User ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-400 font-medium focus:outline-none focus:border-[#845EC2] focus:ring-4 focus:ring-[#845EC2]/20 transition-all shadow-inner"
          />
          {searchId && (
            <button
              onClick={() => setSearchId("")}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-slate-200 font-extrabold focus:outline-none focus:border-[#0081CF] focus:ring-2 focus:ring-[#0081CF]/25 transition-all shadow-inner hover:border-white/20 cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="team_lead">Team Lead</option>
            <option value="team_member">Team Member</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[#060918]/90 border border-white/10 rounded-2xl text-xs text-slate-200 font-extrabold focus:outline-none focus:border-[#0081CF] focus:ring-2 focus:ring-[#0081CF]/25 transition-all shadow-inner hover:border-white/20 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#060918]/90 rounded-2xl border border-white/10 shrink-0 shadow-inner">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === "grid"
                  ? "gradient-palette-bg text-white shadow-lg shadow-[#0081CF]/30 border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2.5 rounded-xl transition-all ${
                viewMode === "table"
                  ? "gradient-palette-bg text-white shadow-lg shadow-[#0081CF]/30 border border-white/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* User Content */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description="No employee accounts match the selected search and filter criteria."
          actionButton={
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30"
            >
              Add New User
            </button>
          }
        />
      ) : viewMode === "grid" ? (
        /* Rich Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((u) => {
            const initials = u.name
              ? u.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U";

            return (
              <div
                key={u._id}
                className="glass-card glass-card-hover p-5 rounded-3xl border border-slate-800/90 shadow-xl flex flex-col justify-between relative group overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Bar: Avatar, Info, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <UserHoverCard user={u}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {u.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </UserHoverCard>
                    <StatusBadge status={u.isActive ? "true" : "false"} />
                  </div>

                  {/* Badges & Department */}
                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <RoleBadge role={u.role} />
                    {u.department && (
                      <span className="px-2.5 py-1 rounded-full bg-[#845EC2]/15 border border-[#845EC2]/35 text-[11px] font-bold text-[#d8b4fe] flex items-center gap-1 shadow-sm">
                        <Briefcase className="w-3 h-3 text-[#c084fc]" />
                        {u.department}
                      </span>
                    )}
                  </div>

                  {/* Hierarchy Links */}
                  <div className="p-3.5 rounded-2xl bg-[#0a1024]/90 border border-white/10 space-y-2 text-xs shadow-inner">
                    {u.designation && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                          <Layers className="w-3.5 h-3.5 text-[#c084fc]" /> Designation
                        </span>
                        <span className="font-extrabold text-[#d8b4fe] text-[11px] truncate max-w-[140px]">
                          {u.designation}
                        </span>
                      </div>
                    )}
                    {u.role === "team_member" && u.teamLeadId && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                          <User className="w-3.5 h-3.5 text-[#6ee7b7]" /> Team Lead
                        </span>
                        <span className="font-extrabold text-[#6ee7b7] text-[11px] truncate max-w-[140px]">
                          {u.teamLeadId.name}
                        </span>
                      </div>
                    )}
                    {u.hrId && (
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                          <Shield className="w-3.5 h-3.5 text-[#7dd3fc]" /> HR
                        </span>
                        <span className="font-extrabold text-[#7dd3fc] text-[11px] truncate max-w-[140px]">
                          {u.hrId.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {u._id.slice(-6).toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/users/${u._id}`}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                      title="Edit User"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`p-2 rounded-xl transition-colors ${
                        u.isActive
                          ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800/80"
                          : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80"
                      }`}
                      title={u.isActive ? "Deactivate" : "Activate"}
                    >
                      {u.isActive ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          userId: u._id,
                          name: u.name,
                        })
                      }
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="glass-panel rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 uppercase font-extrabold text-[10px] text-slate-400 border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department & Designation</th>
                  <th className="px-6 py-4">Reporting Hierarchy</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <UserHoverCard user={u}>
                        <div className="flex items-center gap-3 cursor-pointer">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold flex items-center justify-center shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </UserHoverCard>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <p className="font-bold text-slate-200">{u.department || "-"}</p>
                      {u.designation && (
                        <p className="text-[10px] text-slate-400">{u.designation}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {u.role === "team_member" && u.teamLeadId ? (
                        <div>
                          <span className="text-[11px] font-bold text-emerald-400">
                            TL: {u.teamLeadId.name}
                          </span>
                          {u.hrId && (
                            <p className="text-[10px] text-slate-400">
                              HR: {u.hrId.name}
                            </p>
                          )}
                        </div>
                      ) : u.role === "team_lead" && u.hrId ? (
                        <span className="text-[11px] font-bold text-blue-400">
                          HR: {u.hrId.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.isActive ? "true" : "false"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/users/${u._id}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-2 rounded-xl transition-colors ${
                            u.isActive
                              ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800/80"
                              : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80"
                          }`}
                          title={u.isActive ? "Deactivate" : "Activate"}
                        >
                          {u.isActive ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              userId: u._id,
                              name: u.name,
                            })
                          }
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.name}` : "Create New User"}
        subtitle="Fill in the organizational profile and hierarchy mappings"
        icon={UserPlus}
      >
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">
                Password {editingUser ? "(Leave blank to keep unchanged)" : "*"}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Role *</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="team_lead">Team Lead</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Department</label>
              <input
                type="text"
                placeholder="e.g. IT, Web Development, HR"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-300">Designation</label>
              <input
                type="text"
                placeholder="e.g. Senior Team Lead, Associate"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Conditional Hierarchy Fields */}
          {formData.role === "team_lead" && (
            <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20">
              <label className="font-bold text-indigo-400">Assigned HR *</label>
              <select
                required
                value={formData.hrId}
                onChange={(e) =>
                  setFormData({ ...formData, hrId: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select HR Manager</option>
                {hrs.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name} ({h.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.role === "team_member" && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-indigo-500/20">
              <div className="space-y-1.5">
                <label className="font-bold text-indigo-400">Assigned Team Lead *</label>
                <select
                  required
                  value={formData.teamLeadId}
                  onChange={(e) =>
                    setFormData({ ...formData, teamLeadId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Team Lead</option>
                  {teamLeads.map((tl) => (
                    <option key={tl._id} value={tl._id}>
                      {tl.name} ({tl.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-400">
                  Assigned HR (Optional — will inherit from Team Lead)
                </label>
                <select
                  value={formData.hrId}
                  onChange={(e) =>
                    setFormData({ ...formData, hrId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Inherit from Team Lead</option>
                  {hrs.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? "Saving..." : editingUser ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, userId: null, name: "" })}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to permanently remove ${deleteDialog.name}? This will revoke system access and update associated task allocations.`}
        confirmText="Delete Account"
        loading={deleteLoading}
      />
    </div>
  );
};

export default UserList;
