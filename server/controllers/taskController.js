    const mongoose = require("mongoose");

    const Task = require("../models/Task");
    const User = require("../models/User");
    const Project = require("../models/Project");

    const {
    SUCCESS_MESSAGES,
    } = require("../utils/constants/messages");

    const createTask = async (
    req,
    res,
    next
    ) => {
    try {
        const {
        title,
        description,
        projectId,
        assignedTo,
        priority,
        dueDate,
        } = req.body;

        if (
        !title ||
        !projectId ||
        !assignedTo
        ) {
        return res.status(400).json({
            success: false,
            message:
            "Title, projectId and assignedTo are required.",
        });
        }

        if (
        !mongoose.Types.ObjectId.isValid(
            projectId
        ) ||
        !mongoose.Types.ObjectId.isValid(
            assignedTo
        )
        ) {
        return res.status(400).json({
            success: false,
            message:
            "Invalid project or user ID.",
        });
        }

        const project =
        await Project.findById(projectId);

        if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found.",
        });
        }

        const assignedUser =
        await User.findById(assignedTo);

        if (!assignedUser) {
        return res.status(404).json({
            success: false,
            message: "Assigned user not found.",
        });
        }

        const isProjectMember =
        project.memberIds.some(
            (id) =>
            id.toString() ===
            assignedTo.toString()
        );

        const isTeamLead =
        project.teamLeadIds.some(
            (id) =>
            id.toString() ===
            assignedTo.toString()
        );

        const isHR =
        project.hrIds.some(
            (id) =>
            id.toString() ===
            assignedTo.toString()
        );

        if (
        !isProjectMember &&
        !isTeamLead &&
        !isHR
        ) {
        return res.status(400).json({
            success: false,
            message:
            "User is not assigned to this project.",
        });
        }

        const task = await Task.create({
        title: title.trim(),
        description: description || "",
        projectId,
        assignedTo,
        createdBy: req.user._id,
        priority: priority || "medium",
        dueDate: dueDate || null,
        status: "pending",
        });

        const populatedTask =
        await Task.findById(task._id)
            .populate(
            "projectId",
            "name code status"
            )
            .populate(
            "assignedTo",
            "name email role"
            )
            .populate(
            "createdBy",
            "name email role"
            );

        return res.status(201).json({
        success: true,
        message:
            SUCCESS_MESSAGES.TASK_CREATED,
        task: populatedTask,
        });
    } catch (error) {
        next(error);
    }
    };

    const getTasks = async (
    req,
    res,
    next
    ) => {
    try {
        const {
        projectId,
        assignedTo,
        status,
        } = req.query;

        const filter = {};

        if (projectId) {
        if (
            !mongoose.Types.ObjectId.isValid(
            projectId
            )
        ) {
            return res.status(400).json({
            success: false,
            message: "Invalid project ID.",
            });
        }

        filter.projectId = projectId;
        }

        if (assignedTo) {
        if (
            !mongoose.Types.ObjectId.isValid(
            assignedTo
            )
        ) {
            return res.status(400).json({
            success: false,
            message: "Invalid user ID.",
            });
        }

        filter.assignedTo = assignedTo;
        }

        if (status) {
        filter.status = status;
        }

        if (req.user.role === "team_member") {
        filter.assignedTo = req.user._id;
        }

        const tasks = await Task.find(filter)
        .populate(
            "projectId",
            "name code status"
        )
        .populate(
            "assignedTo",
            "name email role"
        )
        .populate(
            "createdBy",
            "name email role"
        )
        .sort({
            createdAt: -1,
        });

        return res.status(200).json({
        success: true,
        count: tasks.length,
        tasks,
        });
    } catch (error) {
        next(error);
    }
    };

    const getTaskById = async (
    req,
    res,
    next
    ) => {
    try {
        const { id } = req.params;

        if (
        !mongoose.Types.ObjectId.isValid(id)
        ) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID.",
        });
        }

        const task = await Task.findById(id)
        .populate(
            "projectId",
            "name code status"
        )
        .populate(
            "assignedTo",
            "name email role"
        )
        .populate(
            "createdBy",
            "name email role"
        );

        if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found.",
        });
        }

        return res.status(200).json({
        success: true,
        task,
        });
    } catch (error) {
        next(error);
    }
    };

    const updateTask = async (
    req,
    res,
    next
    ) => {
    try {
        const { id } = req.params;

        if (
        !mongoose.Types.ObjectId.isValid(id)
        ) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID.",
        });
        }

        const task =
        await Task.findById(id);

        if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found.",
        });
        }

        const {
        title,
        description,
        assignedTo,
        priority,
        status,
        dueDate,
        } = req.body;

        if (title !== undefined) {
        task.title = title.trim();
        }

        if (description !== undefined) {
        task.description = description;
        }

        if (priority !== undefined) {
        task.priority = priority;
        }

        if (dueDate !== undefined) {
        task.dueDate =
            dueDate || null;
        }

        if (assignedTo !== undefined) {
        if (
            !mongoose.Types.ObjectId.isValid(
            assignedTo
            )
        ) {
            return res.status(400).json({
            success: false,
            message: "Invalid assigned user ID.",
            });
        }

        const assignedUser =
            await User.findById(assignedTo);

        if (!assignedUser) {
            return res.status(404).json({
            success: false,
            message:
                "Assigned user not found.",
            });
        }

        task.assignedTo = assignedTo;
        }

        if (status !== undefined) {
        const allowedStatuses = [
            "pending",
            "in_progress",
            "completed",
            "cancelled",
        ];

        if (
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
            success: false,
            message: "Invalid task status.",
            });
        }

        task.status = status;

        if (status === "completed") {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }
        }

        await task.save();

        const updatedTask =
        await Task.findById(task._id)
            .populate(
            "projectId",
            "name code status"
            )
            .populate(
            "assignedTo",
            "name email role"
            )
            .populate(
            "createdBy",
            "name email role"
            );

        return res.status(200).json({
        success: true,
        message:
            SUCCESS_MESSAGES.TASK_UPDATED,
        task: updatedTask,
        });
    } catch (error) {
        next(error);
    }
    };

    const deleteTask = async (
    req,
    res,
    next
    ) => {
    try {
        const { id } = req.params;

        if (
        !mongoose.Types.ObjectId.isValid(id)
        ) {
        return res.status(400).json({
            success: false,
            message: "Invalid task ID.",
        });
        }

        const task =
        await Task.findByIdAndDelete(id);

        if (!task) {
        return res.status(404).json({
            success: false,
            message: "Task not found.",
        });
        }

        return res.status(200).json({
        success: true,
        message:
            SUCCESS_MESSAGES.TASK_DELETED,
        });
    } catch (error) {
        next(error);
    }
    };

    module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    };