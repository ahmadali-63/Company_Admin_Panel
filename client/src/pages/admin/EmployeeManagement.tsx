import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
} from "lucide-react";
import {
  userService,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "../../services/userService";
import type { Role, User } from "../../types";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { RoleBadge } from "../../components/ui/Badge";
import { Pagination } from "../../components/ui/Pagination";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";

export const EmployeeManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [hrs, setHrs] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [deptFilter, setDeptFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "Admin@12345",
    role: "employee",
    employeeId: "",
    phone: "",
    department: "",
    designation: "",
    hrId: null,
    joiningDate: new Date().toISOString().split("T")[0],
    profileImage: "",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter as Role;
      if (deptFilter) params.department = deptFilter;

      const res = await userService.list(params);
      if (res.data) {
        setUsers(res.data);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHRs = async () => {
    try {
      const res = await userService.list({ role: "hr" as Role, limit: 100 });
      if (res.data) {
        setHrs(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch HR list:", err);
    }
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, deptFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      password: "Admin@12345",
      role: "employee",
      employeeId: "",
      phone: "",
      department: "Engineering",
      designation: "",
      hrId: hrs[0]?._id || null,
      joiningDate: new Date().toISOString().split("T")[0],
      profileImage: "",
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    const hrIdStr = typeof user.hrId === "object" ? user.hrId?._id : user.hrId;
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      employeeId: user.employeeId,
      phone: user.phone || "",
      department: user.department || "",
      designation: user.designation || "",
      hrId: hrIdStr || null,
      joiningDate: user.joiningDate ? new Date(user.joiningDate).toISOString().split("T")[0] : "",
      profileImage: user.profileImage || "",
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setFormError("");
      const payload: CreateUserPayload = { ...formData };
      if (!payload.hrId || payload.role === "hr") {
        delete payload.hrId;
      }
      await userService.create(payload);
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to create user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setFormLoading(true);
      setFormError("");
      const payload: UpdateUserPayload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        employeeId: formData.employeeId,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        hrId: formData.role === "employee" ? formData.hrId : null,
        joiningDate: formData.joiningDate,
        profileImage: formData.profileImage,
      };
      if (formData.password) {
        payload.password = formData.password;
      }
      await userService.update(selectedUser._id, payload);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to update user");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.role === "admin") return;
    try {
      await userService.updateStatus(user._id, !user.isActive);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u)),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setFormLoading(true);
      await userService.remove(selectedUser._id);
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Employee & Workforce Directory
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage company personnel, assign HR supervisors, and oversee account status
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add New Personnel
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="hr">HR Managers</option>
            <option value="employee">Employees</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Executive Management">Executive Management</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="Quality Assurance">Quality Assurance</option>
            <option value="DevOps">DevOps</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" rows={6} />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No employees found"
              description="No personnel records match your current search or filter criteria."
              actionText="Add New Personnel"
              onAction={handleOpenAdd}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-3">Role & ID</th>
                  <th className="py-3 px-3">Department & Title</th>
                  <th className="py-3 px-3">HR Supervisor</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const hrSupervisor = u.hrId as any;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              u.profileImage ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                u.name,
                              )}&background=6366f1&color=fff`
                            }
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <RoleBadge role={u.role} />
                        <div className="text-[11px] font-mono text-slate-500 mt-1">
                          {u.employeeId}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">
                          {u.department || "General"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {u.designation || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {u.role === "employee" ? (
                          hrSupervisor ? (
                            <span className="font-medium text-slate-700">
                              {hrSupervisor.name}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-medium text-[11px]">
                              Unassigned
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          disabled={u.role === "admin"}
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          } ${u.role === "admin" ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {u.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                            title="Edit Personnel"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.role !== "admin" && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete Personnel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => setPage(p)} />
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Company Personnel"
        subtitle="Create a new HR manager or employee profile in MongoDB"
        maxWidth="2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Account Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as Role })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR Manager</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee ID (optional)
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                placeholder="e.g. EMP-201 (Auto if blank)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="name@company.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Initial Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="e.g. Engineering"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Designation / Title
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {formData.role === "employee" && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign HR Supervisor
              </label>
              <select
                value={formData.hrId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hrId: e.target.value ? e.target.value : null,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (Unassigned)</option>
                {hrs.map((hr) => (
                  <option key={hr._id} value={hr._id}>
                    {hr.name} ({hr.employeeId}) - {hr.department}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium shadow-xs disabled:opacity-50"
            >
              {formLoading ? "Creating..." : "Save Personnel"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Personnel: ${selectedUser?.name}`}
        subtitle="Update employee information in MongoDB"
        maxWidth="2xl"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {formError}
          </div>
        )}

        <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Work Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) =>
                  setFormData({ ...formData, employeeId: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Change Password (leave empty to keep current)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {selectedUser?.role === "employee" && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned HR Supervisor
              </label>
              <select
                value={formData.hrId || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hrId: e.target.value ? e.target.value : null,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None (Unassigned)</option>
                {hrs.map((hr) => (
                  <option key={hr._id} value={hr._id}>
                    {hr.name} ({hr.employeeId})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium shadow-xs disabled:opacity-50"
            >
              {formLoading ? "Saving..." : "Update Personnel"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete Personnel Account"
        message={`Are you sure you want to delete ${selectedUser?.name} (${selectedUser?.employeeId})? This action cannot be undone and will detach all associated projects and tasks.`}
        confirmText="Delete Personnel"
        isLoading={formLoading}
      />
    </div>
  );
};

export default EmployeeManagement;
