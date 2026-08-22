import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import api from "../services/api";
import { authService, type LoginPayload } from "../services/authService";
import type { Role, User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isHR: boolean;
  isEmployee: boolean;
  login: (payload: LoginPayload) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => Promise<void>;
  updateCurrentUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as User;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const activeToken = localStorage.getItem("token");
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      if (res.user) {
        setUser(res.user);
        localStorage.setItem("user", JSON.stringify(res.user));
      }
    } catch (err) {
      console.error("Failed to verify authentication session:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (payload: LoginPayload) => {
    try {
      const res = await authService.login(payload);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem("token", res.token);
        if (res.refreshToken) {
          localStorage.setItem("refreshToken", res.refreshToken);
        }
        localStorage.setItem("user", JSON.stringify(res.user));
        return { success: true, user: res.user };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Invalid credentials";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...userData };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    }
  };

  const role: Role | undefined = user?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: role === "admin",
        isHR: role === "hr",
        isEmployee: role === "employee",
        login,
        logout,
        updateCurrentUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
