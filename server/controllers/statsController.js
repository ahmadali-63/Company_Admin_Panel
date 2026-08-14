const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

const getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;

    let userFilter = {};
    let projectFilter = {};
    let taskFilter = {};

    if (userRole === "admin") {
      // Full access
    } else if (userRole === "hr") {
      userFilter = {
        $or: [{ _id: userId }, { hrId: userId }],
      };
      projectFilter = { hrIds: userId };
      // Tasks in permitted projects or assigned/created by HR
      const hrProjects = await Project.find(projectFilter).select("_id");
      const projectIds = hrProjects.map((p) => p._id);
      taskFilter = {
        $or: [{ projectId: { $in: projectIds } }, { createdBy: userId }],
      };
    } else if (userRole === "team_lead") {
      userFilter = {
        $or: [{ _id: userId }, { teamLeadId: userId }],
      };
      projectFilter = { teamLeadIds: userId };
      const tlProjects = await Project.find(projectFilter).select("_id");
      const projectIds = tlProjects.map((p) => p._id);
      taskFilter = {
        $or: [{ projectId: { $in: projectIds } }, { assignedTo: userId }, { createdBy: userId }],
      };
    } else if (userRole === "team_member") {
      userFilter = { _id: userId };
      projectFilter = { memberIds: userId };
      taskFilter = { assignedTo: userId };
    }

    const totalUsers = await User.countDocuments(userFilter);
    const totalHRs = await User.countDocuments({ ...userFilter, role: "hr" });
    const totalTeamLeads = await User.countDocuments({ ...userFilter, role: "team_lead" });
    const totalTeamMembers = await User.countDocuments({ ...userFilter, role: "team_member" });
    const totalAdmins = await User.countDocuments({ ...userFilter, role: "admin" });

    const totalProjects = await Project.countDocuments(projectFilter);
    const activeProjects = await Project.countDocuments({ ...projectFilter, status: "active" });
    const completedProjects = await Project.countDocuments({ ...projectFilter, status: "completed" });
    const planningProjects = await Project.countDocuments({ ...projectFilter, status: "planning" });
    const onHoldProjects = await Project.countDocuments({ ...projectFilter, status: "on_hold" });
    const cancelledProjects = await Project.countDocuments({ ...projectFilter, status: "cancelled" });

    const totalTasks = await Task.countDocuments(taskFilter);
    const pendingTasks = await Task.countDocuments({ ...taskFilter, status: "pending" });
    const inProgressTasks = await Task.countDocuments({ ...taskFilter, status: "in_progress" });
    const completedTasks = await Task.countDocuments({ ...taskFilter, status: "completed" });
    const cancelledTasks = await Task.countDocuments({ ...taskFilter, status: "cancelled" });

    // Recent activity log aggregation
    const recentUsers = await User.find(userFilter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentProjects = await Project.find(projectFilter)
      .select("name code status createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentTasks = await Task.find(taskFilter)
      .select("title status priority createdAt completedAt")
      .populate("assignedTo", "name")
      .populate("projectId", "name")
      .sort({ updatedAt: -1 })
      .limit(5);

    const activities = [];

    recentUsers.forEach((u) => {
      activities.push({
        id: `user-${u._id}`,
        type: "user",
        title: "New Employee Joined",
        description: `${u.name} (${u.role.replace("_", " ").toUpperCase()}) registered`,
        timestamp: u.createdAt,
      });
    });

    recentProjects.forEach((p) => {
      activities.push({
        id: `proj-${p._id}`,
        type: "project",
        title: "Project Milestone",
        description: `Project ${p.name} [${p.code}] is ${p.status.replace("_", " ")}`,
        timestamp: p.createdAt,
      });
    });

    recentTasks.forEach((t) => {
      activities.push({
        id: `task-${t._id}`,
        type: "task",
        title: t.status === "completed" ? "Task Completed" : "Task Updated",
        description: `Task "${t.title}" for ${t.assignedTo?.name || "Member"} is ${t.status}`,
        timestamp: t.completedAt || t.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees: totalUsers,
        totalHRs,
        totalTeamLeads,
        totalTeamMembers,
        totalAdmins,
        totalProjects,
        activeProjects,
        completedProjects,
        planningProjects,
        onHoldProjects,
        cancelledProjects,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        cancelledTasks,
      },
      charts: {
        employeesByRole: [
          { name: "HRs", value: totalHRs },
          { name: "Team Leads", value: totalTeamLeads },
          { name: "Team Members", value: totalTeamMembers },
          { name: "Admins", value: totalAdmins },
        ],
        projectsByStatus: [
          { name: "Planning", value: planningProjects },
          { name: "Active", value: activeProjects },
          { name: "On Hold", value: onHoldProjects },
          { name: "Completed", value: completedProjects },
          { name: "Cancelled", value: cancelledProjects },
        ],
        taskStatusDistribution: [
          { name: "Pending", value: pendingTasks },
          { name: "In Progress", value: inProgressTasks },
          { name: "Completed", value: completedTasks },
          { name: "Cancelled", value: cancelledTasks },
        ],
      },
      recentActivity: activities.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
