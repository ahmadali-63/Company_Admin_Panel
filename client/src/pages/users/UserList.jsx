import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { RoleBadge, StatusBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
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
} from "lucide-react";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null, name: "" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
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
  }, [search, roleFilter, statusFilter]);

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
      password: "", // Leave empty unless changing
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

    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
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
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">User Directory</h1>
          <p className="text-xs text-slate-400">Manage all employee accounts, hierarchy, and permissions</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
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
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No employee accounts match the current filter criteria."
          actionButton={
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
            >
              Add First User
            </button>
          }
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase font-bold text-[11px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Supervisor / HR</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{u.name}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {u.department || "-"}
                      {u.designation && <p className="text-[10px] text-slate-400">{u.designation}</p>}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {u.role === "team_member" && u.teamLeadId ? (
                        <div>
                          <span className="text-[11px] font-semibold text-emerald-400">TL: {u.teamLeadId.name}</span>
                          {u.hrId && <p className="text-[10px] text-slate-400">HR: {u.hrId.name}</p>}
                        </div>
                      ) : u.role === "team_lead" && u.hrId ? (
                        <span className="text-[11px] font-semibold text-blue-400">HR: {u.hrId.name}</span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.isActive ? "true" : "false"} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/users/${u._id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                          }`}
                          title={u.isActive ? "Deactivate" : "Activate"}
                        >
                          {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, userId: u._id, name: u.name })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
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
      >
        {formError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Password {editingUser ? "(Leave blank to keep unchanged)" : "*"}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="admin">Admin</option>
                <option value="hr">HR</option>
                <option value="team_lead">Team Lead</option>
                <option value="team_member">Team Member</option>
              </select>
            </div>
          </div>

          {/* Conditional Hierarchy Fields */}
          {formData.role === "team_lead" && (
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="font-semibold text-indigo-400">Assigned HR *</label>
              <select
                required
                value={formData.hrId}
                onChange={(e) => setFormData({ ...formData, hrId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
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
            <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <label className="font-semibold text-indigo-400">Assigned Team Lead *</label>
                <select
                  required
                  value={formData.teamLeadId}
                  onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Team Lead</option>
                  {teamLeads.map((tl) => (
                    <option key={tl._id} value={tl._id}>
                      {tl.name} ({tl.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
            >
              {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              {editingUser ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, userId: null, name: "" })}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete User"
        message={`Are you sure you want to permanently delete "${deleteDialog.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default UserList;
