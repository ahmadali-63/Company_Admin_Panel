export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESSFUL: "Login successful",
  REGISTRATION_SUCCESSFUL: "Registration successful",
  TOKEN_REFRESHED: "Token refreshed",
  LOGOUT_SUCCESSFUL: "Logged out successfully",
  AUTHENTICATION_SUCCESSFUL: "Authentication successful",

  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_STATUS_UPDATED: "User status updated successfully",

  PROJECT_CREATED: "Project created successfully",
  PROJECT_UPDATED: "Project updated successfully",
  PROJECT_DELETED: "Project deleted successfully",

  HR_ASSIGNED: "HR assigned successfully.",
  HR_REMOVED: "HR removed successfully.",
  TEAM_LEAD_ASSIGNED: "Team Lead assigned successfully.",
  TEAM_LEAD_REMOVED: "Team Lead removed successfully.",
  MEMBER_ASSIGNED: "Team Member assigned successfully.",
  MEMBER_REMOVED: "Team Member removed successfully.",

  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
} as const;

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCOUNT_INACTIVE:
    "This account is inactive. Please contact your administrator.",
  AUTH_REQUIRED: "Authentication required.",
  TOKEN_MISSING: "Authentication token is missing.",
  TOKEN_EXPIRED: "Token has expired.",
  TOKEN_INVALID: "Invalid authentication token.",
  USER_NOT_FOUND: "User account not found.",
  FORBIDDEN: "You do not have permission to perform this action.",
  INTERNAL: "Internal server error.",
} as const;
