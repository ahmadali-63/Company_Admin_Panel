    const mongoose = require("mongoose");
    const Project = require("../models/Project");
    const User = require("../models/User");

    const { SUCCESS_MESSAGES } = require("../utils/constants/messages");

    const allowedStatuses = ["planning", "active", "on_hold", "completed", "cancelled"];

    const createProject = async (req, res, next) => {
    try {
        const { name, code, description, status, startDate, endDate } = req.body;

        if (!name || !code) {
        return res.status(400).json({
            success: false,
            message: "Project name and code are required.",
        });
        }

        const normalizedCode = code.trim().toUpperCase();

        const existingProject = await Project.findOne({ code: normalizedCode });

        if (existingProject) {
        return res.status(409).json({
            success: false,
            message: "A project with this code already exists.",
        });
        }

        if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project status.",
        });
        }

        const project = await Project.create({
        name: name.trim(),
        code: normalizedCode,
        description: description || "",
        status: status || "planning",
        startDate: startDate || null,
        endDate: endDate || null,
        createdBy: req.user._id,
        hrIds: [],
        teamLeadIds: [],
        memberIds: [],
        isActive: true,
        });

        const populatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_CREATED || "Project created successfully.",
        project: populatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const getProjects = async (req, res, next) => {
    try {
        const { status, search } = req.query;

        const filter = {};

        if (req.user.role === "admin") {
        // Admin sees all projects
        } else if (req.user.role === "hr") {
        filter.hrIds = req.user._id;
        } else if (req.user.role === "team_lead") {
        filter.teamLeadIds = req.user._id;
        } else if (req.user.role === "team_member") {
        filter.memberIds = req.user._id;
        }

        if (status) {
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
            success: false,
            message: "Invalid status.",
            });
        }
        filter.status = status;
        }

        if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } },
        ];
        }

        const projects = await Project.find(filter)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation")
        .sort({ createdAt: -1 });

        return res.status(200).json({
        success: true,
        count: projects.length,
        projects,
        });
    } catch (error) {
        next(error);
    }
    };

    const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID.",
        });
        }

        const project = await Project.findById(id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found.",
        });
        }

        return res.status(200).json({
        success: true,
        project,
        });
    } catch (error) {
        next(error);
    }
    };

    const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID.",
        });
        }

        const project = await Project.findById(id);

        if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found.",
        });
        }

        const { name, code, description, status, startDate, endDate, isActive } = req.body;

        if (name !== undefined) {
        project.name = name.trim();
        }

        if (code !== undefined) {
        const normalizedCode = code.trim().toUpperCase();
        const duplicate = await Project.findOne({
            code: normalizedCode,
            _id: { $ne: id },
        });

        if (duplicate) {
            return res.status(409).json({
            success: false,
            message: "Another project already uses this code.",
            });
        }

        project.code = normalizedCode;
        }

        if (description !== undefined) {
        project.description = description;
        }

        if (status !== undefined) {
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
            success: false,
            message: "Invalid project status.",
            });
        }
        project.status = status;
        }

        if (startDate !== undefined) {
        project.startDate = startDate || null;
        }

        if (endDate !== undefined) {
        project.endDate = endDate || null;
        }

        if (isActive !== undefined) {
        if (typeof isActive !== "boolean") {
            return res.status(400).json({
            success: false,
            message: "isActive must be true or false.",
            });
        }
        project.isActive = isActive;
        }

        await project.save();

        const updatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_UPDATED || "Project updated successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const assignHR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hrId } = req.body;

        if (!hrId) {
        return res.status(400).json({ success: false, message: "HR ID is required." });
        }

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(hrId)) {
        return res.status(400).json({ success: false, message: "Invalid project or HR ID." });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found." });

        const hr = await User.findById(hrId);
        if (!hr) return res.status(404).json({ success: false, message: "HR not found." });

        if (hr.role !== "hr") {
        return res.status(400).json({ success: false, message: "Selected user is not an HR." });
        }

        if (!hr.isActive) {
        return res.status(400).json({ success: false, message: "Cannot assign inactive user." });
        }

        const alreadyAssigned = project.hrIds.some(
        (existingId) => existingId.toString() === hr._id.toString()
        );

        if (alreadyAssigned) {
        return res.status(409).json({
            success: false,
            message: "This HR is already assigned to this project.",
        });
        }

        project.hrIds.push(hr._id);
        await project.save();

        if (!hr.projectIds) hr.projectIds = [];
        if (!hr.projectIds.some((pId) => pId.toString() === project._id.toString())) {
        hr.projectIds.push(project._id);
        await hr.save();
        }

        const updatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(200).json({
        success: true,
        message: "HR assigned successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const removeHR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hrId } = req.body;

        if (!hrId) return res.status(400).json({ success: false, message: "HR ID is required." });
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(hrId)) {
        return res.status(400).json({ success: false, message: "Invalid project or HR ID." });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found." });

        const hr = await User.findById(hrId);
        if (!hr) return res.status(404).json({ success: false, message: "HR not found." });

        project.hrIds = project.hrIds.filter((existingId) => existingId.toString() !== hrId.toString());
        await project.save();

        hr.projectIds = (hr.projectIds || []).filter((pId) => pId.toString() !== id.toString());
        await hr.save();

        const updatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(200).json({
        success: true,
        message: "HR removed successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const assignTeamLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { teamLeadId } = req.body;

        if (!teamLeadId) {
        return res.status(400).json({ success: false, message: "Team Lead ID is required." });
        }

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(teamLeadId)) {
        return res.status(400).json({ success: false, message: "Invalid project or Team Lead ID." });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found." });

        const teamLead = await User.findById(teamLeadId);
        if (!teamLead) return res.status(404).json({ success: false, message: "Team Lead not found." });

        if (teamLead.role !== "team_lead") {
        return res.status(400).json({ success: false, message: "Selected user is not a Team Lead." });
        }

        if (!teamLead.isActive) {
        return res.status(400).json({ success: false, message: "Cannot assign inactive user." });
        }

        const alreadyAssigned = project.teamLeadIds.some(
        (existingId) => existingId.toString() === teamLead._id.toString()
        );

        if (alreadyAssigned) {
        return res.status(409).json({
            success: false,
            message: "This Team Lead is already assigned to this project.",
        });
        }

        project.teamLeadIds.push(teamLead._id);
        await project.save();

        if (!teamLead.projectIds) teamLead.projectIds = [];
        if (!teamLead.projectIds.some((pId) => pId.toString() === project._id.toString())) {
        teamLead.projectIds.push(project._id);
        await teamLead.save();
        }

        const updatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(200).json({
        success: true,
        message: "Team Lead assigned successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const removeTeamLead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { teamLeadId } = req.body;

        if (!teamLeadId) return res.status(400).json({ success: false, message: "Team Lead ID is required." });
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(teamLeadId)) {
        return res.status(400).json({ success: false, message: "Invalid project or Team Lead ID." });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found." });

        const teamLead = await User.findById(teamLeadId);
        if (!teamLead) return res.status(404).json({ success: false, message: "Team Lead not found." });

        project.teamLeadIds = project.teamLeadIds.filter((existingId) => existingId.toString() !== teamLeadId.toString());
        await project.save();

        teamLead.projectIds = (teamLead.projectIds || []).filter((pId) => pId.toString() !== id.toString());
        await teamLead.save();

        const updatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(200).json({
        success: true,
        message: "Team Lead removed successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const assignMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;

        if (!memberId) {
        return res.status(400).json({ success: false, message: "Team Member ID is required." });
        }

        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ success: false, message: "Invalid project or Team Member ID." });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found." });

        const member = await User.findById(memberId);
        if (!member) return res.status(404).json({ success: false, message: "Team Member not found." });

        if (member.role !== "team_member") {
        return res.status(400).json({ success: false, message: "Selected user is not a Team Member." });
        }

        if (!member.isActive) {
        return res.status(400).json({ success: false, message: "Cannot assign inactive user." });
        }

        const alreadyAssigned = project.memberIds.some(
        (existingId) => existingId.toString() === member._id.toString()
        );

        if (alreadyAssigned) {
        return res.status(409).json({
            success: false,
            message: "This Team Member is already assigned to this project.",
        });
        }

        project.memberIds.push(member._id);
        await project.save();

        if (!member.projectIds) member.projectIds = [];
        if (!member.projectIds.some((pId) => pId.toString() === project._id.toString())) {
        member.projectIds.push(project._id);
        await member.save();
        }

        const updatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(200).json({
        success: true,
        message: "Team Member assigned successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const removeMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { memberId } = req.body;

        if (!memberId) return res.status(400).json({ success: false, message: "Team Member ID is required." });
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(memberId)) {
        return res.status(400).json({ success: false, message: "Invalid project or Team Member ID." });
        }

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ success: false, message: "Project not found." });

        const member = await User.findById(memberId);
        if (!member) return res.status(404).json({ success: false, message: "Team Member not found." });

        project.memberIds = project.memberIds.filter((existingId) => existingId.toString() !== memberId.toString());
        await project.save();

        member.projectIds = (member.projectIds || []).filter((pId) => pId.toString() !== id.toString());
        await member.save();

        const updatedProject = await Project.findById(project._id)
        .populate("createdBy", "name email role")
        .populate("hrIds", "name email role department designation")
        .populate("teamLeadIds", "name email role department designation")
        .populate("memberIds", "name email role department designation");

        return res.status(200).json({
        success: true,
        message: "Team Member removed successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid project ID." });
        }

        const project = await Project.findById(id);

        if (!project) {
        return res.status(404).json({ success: false, message: "Project not found." });
        }

        await Project.findByIdAndDelete(id);

        await User.updateMany(
        { projectIds: id },
        { $pull: { projectIds: id } }
        );

        return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.PROJECT_DELETED || "Project deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
    };

    module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    assignHR,
    removeHR,
    assignTeamLead,
    removeTeamLead,
    assignMember,
    removeMember,
    deleteProject,
    };