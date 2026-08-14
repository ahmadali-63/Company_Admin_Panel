    const bcrypt = require("bcryptjs");
    const mongoose = require("mongoose");

    const User = require("../models/User");

    const { SUCCESS_MESSAGES } = require("../utils/constants/messages");

    const allowedRoles = ["admin", "hr", "team_lead", "team_member"];

    const createUser = async (req, res, next) => {
    try {
        const {
        name,
        email,
        password,
        role,
        phone,
        department,
        designation,
        hrId,
        teamLeadId,
        projectIds,
        } = req.body;

        if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password and role are required.",
        });
        }

        if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid role.",
        });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "A user with this email already exists.",
        });
        }

        let finalHrId = hrId || null;
        let finalTeamLeadId = teamLeadId || null;

        if (role === "admin") {
        finalHrId = null;
        finalTeamLeadId = null;
        } else if (role === "hr") {
        finalHrId = null;
        finalTeamLeadId = null;
        } else if (role === "team_lead") {
        if (!hrId || !mongoose.Types.ObjectId.isValid(hrId)) {
            return res.status(400).json({
            success: false,
            message: "Team Lead must be assigned to a valid HR.",
            });
        }
        const hrUser = await User.findById(hrId);
        if (!hrUser || hrUser.role !== "hr") {
            return res.status(400).json({
            success: false,
            message: "Selected HR is invalid or not an HR role.",
            });
        }
        finalHrId = hrUser._id;
        finalTeamLeadId = null;
        } else if (role === "team_member") {
        if (!teamLeadId || !mongoose.Types.ObjectId.isValid(teamLeadId)) {
            return res.status(400).json({
            success: false,
            message: "Team Member must be assigned to a valid Team Lead.",
            });
        }
        const leadUser = await User.findById(teamLeadId);
        if (!leadUser || leadUser.role !== "team_lead") {
            return res.status(400).json({
            success: false,
            message: "Selected Team Lead is invalid or not a Team Lead role.",
            });
        }
        if (!leadUser.hrId) {
            return res.status(400).json({
            success: false,
            message: "The selected Team Lead is not assigned to an HR.",
            });
        }
        if (hrId && hrId.toString() !== leadUser.hrId.toString()) {
            return res.status(400).json({
            success: false,
            message: "Team Member assigned to a Team Lead must belong to the same HR.",
            });
        }
        finalHrId = leadUser.hrId;
        finalTeamLeadId = leadUser._id;
        }

        const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role,
        phone: phone || "",
        department: department || "",
        designation: designation || "",
        hrId: finalHrId,
        teamLeadId: finalTeamLeadId,
        projectIds: Array.isArray(projectIds) ? projectIds : [],
        isActive: true,
        });

        const userData = await User.findById(user._id)
        .select("-password")
        .populate("hrId", "name email role")
        .populate("teamLeadId", "name email role")
        .populate("projectIds", "name code status");

        return res.status(201).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_CREATED || "User created successfully.",
        user: userData,
        });
    } catch (error) {
        next(error);
    }
    };

    const getUsers = async (req, res, next) => {
    try {
        const { role, isActive, search } = req.query;

        const filter = {};

        if (req.user.role === "admin") {
        // Admin sees all
        } else if (req.user.role === "hr") {
        filter.$or = [{ _id: req.user._id }, { hrId: req.user._id }];
        } else if (req.user.role === "team_lead") {
        filter.$or = [{ _id: req.user._id }, { teamLeadId: req.user._id }];
        }

        if (role) {
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
            success: false,
            message: "Invalid role.",
            });
        }
        filter.role = role;
        }

        if (isActive !== undefined) {
        filter.isActive = isActive === "true";
        }

        if (search) {
        const searchConditions = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];

        if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
            delete filter.$or;
        } else {
            filter.$or = searchConditions;
        }
        }

        const users = await User.find(filter)
        .select("-password")
        .populate("hrId", "name email role department designation")
        .populate("teamLeadId", "name email role department designation")
        .populate("projectIds", "name code status")
        .sort({ createdAt: -1 });

        return res.status(200).json({
        success: true,
        count: users.length,
        users,
        });
    } catch (error) {
        next(error);
    }
    };

    const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID.",
        });
        }

        const user = await User.findById(id)
        .select("-password")
        .populate("hrId", "name email role department designation")
        .populate("teamLeadId", "name email role department designation")
        .populate("projectIds", "name code status");

        if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
        }

        return res.status(200).json({
        success: true,
        user,
        });
    } catch (error) {
        next(error);
    }
    };

    const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID.",
        });
        }

        const user = await User.findById(id);

        if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
        }

        const {
        name,
        email,
        password,
        role,
        phone,
        department,
        designation,
        hrId,
        teamLeadId,
        projectIds,
        } = req.body;

        if (email) {
        const normalizedEmail = email.trim().toLowerCase();
        const emailExists = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: id },
        });

        if (emailExists) {
            return res.status(409).json({
            success: false,
            message: "This email is already in use.",
            });
        }
        user.email = normalizedEmail;
        }

        if (name !== undefined) user.name = name.trim();
        if (phone !== undefined) user.phone = phone;
        if (department !== undefined) user.department = department;
        if (designation !== undefined) user.designation = designation;

        const targetRole = role || user.role;
        if (role !== undefined && !allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role." });
        }
        user.role = targetRole;

        if (targetRole === "team_lead") {
        const checkHrId = hrId !== undefined ? hrId : user.hrId;
        if (!checkHrId || !mongoose.Types.ObjectId.isValid(checkHrId)) {
            return res.status(400).json({ success: false, message: "Team Lead must be assigned to an HR." });
        }
        user.hrId = checkHrId;
        user.teamLeadId = null;
        } else if (targetRole === "team_member") {
        const checkLeadId = teamLeadId !== undefined ? teamLeadId : user.teamLeadId;
        if (!checkLeadId || !mongoose.Types.ObjectId.isValid(checkLeadId)) {
            return res.status(400).json({ success: false, message: "Team Member must be assigned to a Team Lead." });
        }
        const leadUser = await User.findById(checkLeadId);
        if (!leadUser || leadUser.role !== "team_lead") {
            return res.status(400).json({ success: false, message: "Invalid Team Lead." });
        }
        user.teamLeadId = leadUser._id;
        user.hrId = leadUser.hrId;
        } else if (targetRole === "hr" || targetRole === "admin") {
        user.hrId = null;
        user.teamLeadId = null;
        }

        if (projectIds !== undefined) {
        if (!Array.isArray(projectIds)) {
            return res.status(400).json({
            success: false,
            message: "projectIds must be an array.",
            });
        }
        user.projectIds = projectIds;
        }

        if (password) {
        user.password = await bcrypt.hash(password, 12);
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
        .select("-password")
        .populate("hrId", "name email role department designation")
        .populate("teamLeadId", "name email role department designation")
        .populate("projectIds", "name code status");

        return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_UPDATED || "User updated successfully.",
        user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
    };

    const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID.",
        });
        }

        if (typeof isActive !== "boolean") {
        return res.status(400).json({
            success: false,
            message: "isActive must be true or false.",
        });
        }

        const user = await User.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
        ).select("-password");

        if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
        }

        return res.status(200).json({
        success: true,
        message: "User status updated successfully.",
        user,
        });
    } catch (error) {
        next(error);
    }
    };

    const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID.",
        });
        }

        if (req.user._id.toString() === id.toString()) {
        return res.status(400).json({
            success: false,
            message: "You cannot delete your own account.",
        });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
        }

        return res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.USER_DELETED || "User deleted successfully.",
        });
    } catch (error) {
        next(error);
    }
    };

    module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser,
    };