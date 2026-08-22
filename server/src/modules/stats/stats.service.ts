import type { Types } from "mongoose";

import { ROLE } from "../../common/constants/roles.js";
import type { AuthenticatedUser } from "../../common/types/auth.js";
import type { Filter } from "../../common/types/db.js";
import { AttendanceModel } from "../attendance/attendance.model.js";
import { getTodayDateString } from "../attendance/attendance.service.js";
import { LeaveModel } from "../leave/leave.model.js";
import { ProjectModel, type ProjectAttrs } from "../project/project.model.js";
import { TaskModel, type TaskAttrs } from "../task/task.model.js";
import { UserModel, type UserAttrs } from "../user/user.model.js";

export const statsService = {
  async dashboard(actor: AuthenticatedUser) {
    const today = getTodayDateString();

    if (actor.role === ROLE.ADMIN) {
      return this.adminDashboard(today);
    } else if (actor.role === ROLE.HR) {
      return this.hrDashboard(actor, today);
    } else {
      return this.employeeDashboard(actor, today);
    }
  },

  async adminDashboard(today: string) {
    const [
      totalUsers,
      totalEmployees,
      totalHRs,
      departments,
      todayAttendances,
      activeLeaves,
      pendingLeaves,
      allTasks,
      allProjects,
      recentUsers,
    ] = await Promise.all([
      UserModel.countDocuments({ isActive: true }),
      UserModel.countDocuments({ role: ROLE.EMPLOYEE, isActive: true }),
      UserModel.countDocuments({ role: ROLE.HR, isActive: true }),
      UserModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
      ]),
      AttendanceModel.find({ date: today }).populate("userId", "name email employeeId department designation role"),
      LeaveModel.countDocuments({
        status: "approved",
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }),
      LeaveModel.countDocuments({ status: "pending" }),
      TaskModel.find().populate("assignedTo", "name employeeId").populate("projectId", "name code").sort({ deadline: 1 }),
      ProjectModel.find().populate("hrIds", "name").populate("employeeIds", "name"),
      UserModel.find().select("name email employeeId role department createdAt").sort({ createdAt: -1 }).limit(5),
    ]);

    // Attendance stats
    const presentToday = todayAttendances.filter((a) => a.status === "Present" || a.status === "Late" || a.status === "Half Day" || a.status === "Checked Out").length;
    const currentlyInOffice = todayAttendances.filter((a) => a.checkIn && !a.checkOut).length;
    const totalStaff = totalEmployees + totalHRs;
    const absentToday = Math.max(0, totalStaff - presentToday - activeLeaves);

    // Task stats
    const now = new Date();
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    allTasks.forEach((t) => {
      if (t.status === "completed") {
        completedTasks++;
      } else if (t.deadline && now > new Date(t.deadline)) {
        overdueTasks++;
      } else if (t.status === "in_progress") {
        inProgressTasks++;
      } else {
        pendingTasks++;
      }
    });

    // Project stats
    const activeProjects = allProjects.filter((p) => p.status === "active").length;
    const planningProjects = allProjects.filter((p) => p.status === "planning").length;
    const completedProjects = allProjects.filter((p) => p.status === "completed").length;
    const onHoldProjects = allProjects.filter((p) => p.status === "on_hold").length;

    // Upcoming deadlines (next 7 days, non-completed)
    const upcomingDeadlines = allTasks
      .filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) >= now)
      .slice(0, 5);

    const overdueList = allTasks
      .filter((t) => t.status !== "completed" && t.deadline && now > new Date(t.deadline))
      .slice(0, 5);

    return {
      stats: {
        totalEmployees,
        totalHRs,
        totalStaff,
        presentToday,
        absentToday,
        currentlyInOffice,
        onLeave: activeLeaves,
        pendingLeaves,
        totalTasks: allTasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        totalProjects: allProjects.length,
        activeProjects,
        planningProjects,
        completedProjects,
        onHoldProjects,
      },
      charts: {
        attendanceBreakdown: [
          { name: "Present", value: presentToday, color: "#10B981" },
          { name: "Absent", value: absentToday, color: "#EF4444" },
          { name: "On Leave", value: activeLeaves, color: "#F59E0B" },
        ],
        departmentDistribution: departments
          .filter((d) => d._id)
          .map((d) => ({ name: d._id || "Other", count: d.count })),
        taskStatusDistribution: [
          { name: "Pending", value: pendingTasks },
          { name: "In Progress", value: inProgressTasks },
          { name: "Completed", value: completedTasks },
          { name: "Overdue", value: overdueTasks },
        ],
        projectStatusDistribution: [
          { name: "Planning", value: planningProjects },
          { name: "Active", value: activeProjects },
          { name: "On Hold", value: onHoldProjects },
          { name: "Completed", value: completedProjects },
        ],
      },
      todayAttendance: todayAttendances.slice(0, 10),
      upcomingDeadlines,
      overdueTasks: overdueList,
      recentUsers,
    };
  },

  async hrDashboard(actor: AuthenticatedUser, today: string) {
    const myEmployees = await UserModel.find({ hrId: actor._id, isActive: true }).select("_id name email employeeId department designation profileImage").lean();
    const myEmployeeIds = myEmployees.map((e) => e._id);
    const allTrackedIds = [...myEmployeeIds, actor._id];

    const [
      todayAttendances,
      myActiveLeaves,
      pendingLeaveRequests,
      teamTasks,
      myProjects,
    ] = await Promise.all([
      AttendanceModel.find({
        date: today,
        userId: { $in: allTrackedIds },
      }).populate("userId", "name email employeeId department designation profileImage"),
      LeaveModel.countDocuments({
        userId: { $in: myEmployeeIds },
        status: "approved",
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }),
      LeaveModel.find({
        userId: { $in: myEmployeeIds },
        status: "pending",
      }).populate("userId", "name email employeeId department designation"),
      TaskModel.find({
        $or: [
          { assignedTo: { $in: allTrackedIds } },
          { assignedBy: actor._id },
        ],
      }).populate("assignedTo", "name employeeId").populate("projectId", "name code").sort({ deadline: 1 }),
      ProjectModel.find({ hrIds: actor._id }),
    ]);

    const presentToday = todayAttendances.filter((a) => a.status === "Present" || a.status === "Late" || a.status === "Half Day" || a.status === "Checked Out").length;
    const absentToday = Math.max(0, myEmployees.length - presentToday - myActiveLeaves);

    const now = new Date();
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    teamTasks.forEach((t) => {
      if (t.status === "completed") {
        completedTasks++;
      } else if (t.deadline && now > new Date(t.deadline)) {
        overdueTasks++;
      } else if (t.status === "in_progress") {
        inProgressTasks++;
      } else {
        pendingTasks++;
      }
    });

    const upcomingDeadlines = teamTasks
      .filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) >= now)
      .slice(0, 5);

    const overdueList = teamTasks
      .filter((t) => t.status !== "completed" && t.deadline && now > new Date(t.deadline))
      .slice(0, 5);

    return {
      stats: {
        myEmployeesCount: myEmployees.length,
        presentToday,
        absentToday,
        onLeave: myActiveLeaves,
        pendingLeaveRequests: pendingLeaveRequests.length,
        totalTasks: teamTasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        assignedProjectsCount: myProjects.length,
      },
      charts: {
        attendanceBreakdown: [
          { name: "Present", value: presentToday },
          { name: "Absent", value: absentToday },
          { name: "On Leave", value: myActiveLeaves },
        ],
        taskStatusDistribution: [
          { name: "Pending", value: pendingTasks },
          { name: "In Progress", value: inProgressTasks },
          { name: "Completed", value: completedTasks },
          { name: "Overdue", value: overdueTasks },
        ],
      },
      todayAttendance: todayAttendances,
      pendingLeaveRequests,
      upcomingDeadlines,
      overdueTasks: overdueList,
      myEmployees: myEmployees.slice(0, 8),
    };
  },

  async employeeDashboard(actor: AuthenticatedUser, today: string) {
    const [todayAttendance, myTasks, myLeaves, myProjects] = await Promise.all([
      AttendanceModel.findOne({ userId: actor._id, date: today }),
      TaskModel.find({ assignedTo: actor._id }).populate("projectId", "name code").populate("assignedBy", "name email").sort({ deadline: 1 }),
      LeaveModel.find({ userId: actor._id }).sort({ createdAt: -1 }).limit(5),
      ProjectModel.find({
        $or: [{ employeeIds: actor._id }, { memberIds: actor._id }],
      }),
    ]);

    const now = new Date();
    let pendingTasks = 0;
    let inProgressTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    myTasks.forEach((t) => {
      if (t.status === "completed") {
        completedTasks++;
      } else if (t.deadline && now > new Date(t.deadline)) {
        overdueTasks++;
      } else if (t.status === "in_progress") {
        inProgressTasks++;
      } else {
        pendingTasks++;
      }
    });

    const upcomingDeadlines = myTasks
      .filter((t) => t.status !== "completed" && t.deadline && new Date(t.deadline) >= now)
      .slice(0, 5);

    const pendingLeaveCount = myLeaves.filter((l) => l.status === "pending").length;
    const approvedLeaveCount = myLeaves.filter((l) => l.status === "approved").length;

    return {
      stats: {
        totalTasks: myTasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        assignedProjectsCount: myProjects.length,
        pendingLeaves: pendingLeaveCount,
        approvedLeaves: approvedLeaveCount,
      },
      todayAttendance: todayAttendance
        ? {
            hasCheckedIn: true,
            hasCheckedOut: !!todayAttendance.checkOut,
            checkInTime: todayAttendance.checkIn,
            checkOutTime: todayAttendance.checkOut,
            workingHours: todayAttendance.workingHours,
            status: todayAttendance.status,
          }
        : {
            hasCheckedIn: false,
            hasCheckedOut: false,
            status: "Not Checked In",
          },
      recentTasks: myTasks.slice(0, 6),
      upcomingDeadlines,
      recentLeaves: myLeaves,
    };
  },
};
