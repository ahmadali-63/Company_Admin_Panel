import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/users/UserList";
import UserDetail from "./pages/users/UserDetail";
import HRList from "./pages/hrs/HRList";
import HRDetail from "./pages/hrs/HRDetail";
import TeamLeadList from "./pages/teamLeads/TeamLeadList";
import TeamLeadDetail from "./pages/teamLeads/TeamLeadDetail";
import TeamMemberList from "./pages/teamMembers/TeamMemberList";
import TeamMemberDetail from "./pages/teamMembers/TeamMemberDetail";
import ProjectList from "./pages/projects/ProjectList";
import ProjectDetail from "./pages/projects/ProjectDetail";
import TaskList from "./pages/tasks/TaskList";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Admin Only Routes */}
              <Route element={<RoleRoute allowedRoles={["admin"]} />}>
                <Route path="/users" element={<UserList />} />
                <Route path="/users/:id" element={<UserDetail />} />
              </Route>

              {/* HR & Admin Routes */}
              <Route element={<RoleRoute allowedRoles={["admin", "hr"]} />}>
                <Route path="/hrs" element={<HRList />} />
                <Route path="/hrs/:id" element={<HRDetail />} />
              </Route>

              {/* Team Lead, HR & Admin Routes */}
              <Route element={<RoleRoute allowedRoles={["admin", "hr", "team_lead"]} />}>
                <Route path="/team-leads" element={<TeamLeadList />} />
                <Route path="/team-leads/:id" element={<TeamLeadDetail />} />
                <Route path="/team-members" element={<TeamMemberList />} />
                <Route path="/team-members/:id" element={<TeamMemberDetail />} />
              </Route>

              {/* All Permitted Users Routes */}
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
