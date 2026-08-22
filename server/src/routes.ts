import { Router } from "express";

import { authRoutes } from "./modules/auth/auth.routes.js";
import { attendanceRoutes } from "./modules/attendance/attendance.routes.js";
import { leaveRoutes } from "./modules/leave/leave.routes.js";
import { notificationRoutes } from "./modules/notification/notification.routes.js";
import { projectRoutes } from "./modules/project/project.routes.js";
import { statsRoutes } from "./modules/stats/stats.routes.js";
import { taskRoutes } from "./modules/task/task.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/attendance", attendanceRoutes);
apiRouter.use("/leaves", leaveRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/stats", statsRoutes);
