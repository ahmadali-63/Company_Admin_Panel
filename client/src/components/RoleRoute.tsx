import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface RoleRouteProps {
  allowedRoles: Role[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    // If user's role is not permitted, redirect to their role-appropriate dashboard
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === "hr") return <Navigate to="/hr/dashboard" replace />;
    if (user?.role === "employee") return <Navigate to="/employee/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
