import { Router } from "express";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { projectRoutes } from "./modules/project/project.routes.js";
import { statsRoutes } from "./modules/stats/stats.routes.js";
import { taskRoutes } from "./modules/task/task.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";

import { attendanceRoutes } from "./modules/attendance/attendance.routes.js";
import { leaveRoutes } from "./modules/leave/leave.routes.js";

/**
 * Single mount point for every feature module. Adding a feature means adding
 * one line here and one folder under `src/modules/`.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/stats", statsRoutes);
apiRouter.use("/attendance", attendanceRoutes);
apiRouter.use("/leave", leaveRoutes);

