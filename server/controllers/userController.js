    const bcrypt = require("bcryptjs");
    const mongoose = require("mongoose");
    const User = require("../models/User");

    const allowedRoles = [
    "admin",
    "hr",
    "team_lead",
    "team_member",
    ];

    const getSafeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    projectIds: user.projectIds,
    hrId: user.hrId,
    teamLeadId: user.teamLeadId,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE USER
    |--------------------------------------------------------------------------
    */

    const createUser = async (req, res, next) => {
    try {
        const {
        name,
        email,
        password,
        role,
        hrId = null,
        teamLeadId = null,
        } = req.body;

        if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message:
            "Name, email, password and role are required.",
        });
        }

        if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user role.",
        });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
        email: normalizedEmail,
        });

        if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "A user with this email already exists.",
        });
        }

        let validHrId = null;
        let validTeamLeadId = null;

        /*
        * Validate HR
        */
        if (hrId) {
        if (!mongoose.Types.ObjectId.isValid(hrId)) {
            return res.status(400).json({
            success: false,
            message: "Invalid HR ID.",
            });
        }

        const hr = await User.findOne({
            _id: hrId,
            role: "hr",
            isActive: true,
        });

        if (!hr) {
            return res.status(400).json({
            success: false,
            message:
                "The selected HR does not exist or is inactive.",
            });
        }

        validHrId = hr._id;
        }

        /*
        * Validate Team Lead
        */
        if (teamLeadId) {
        if (!mongoose.Types.ObjectId.isValid(teamLeadId)) {
            return res.status(400).json({
            success: false,
            message: "Invalid Team Lead ID.",
            });
        }

        const teamLead = await User.findOne({
            _id: teamLeadId,
            role: "team_lead",
            isActive: true,
        });

        if (!teamLead) {
            return res.status(400).json({
            success: false,
            message:
                "The selected Team Lead does not exist or is inactive.",
            });
        }

        validTeamLeadId = teamLead._id;

        /*
        * Make sure the Team Lead belongs to
        * the selected HR.
        */
        if (role === "team_member" && validHrId) {
            if (
            !teamLead.hrId ||
            teamLead.hrId.toString() !==
                validHrId.toString()
            ) {
            return res.status(400).json({
                success: false,
                message:
                "The selected Team Lead does not belong to the selected HR.",
            });
            }
        }
        }

        /*
        * Role-specific hierarchy rules
        */

        if (role === "admin") {
        if (validHrId || validTeamLeadId) {
            return res.status(400).json({
            success: false,
            message:
                "An Admin cannot be assigned under HR or Team Lead.",
            });
        }
        }

        if (role === "hr") {
        if (validHrId || validTeamLeadId) {
            return res.status(400).json({
            success: false,
            message:
                "An HR cannot be assigned under HR or Team Lead.",
            });
        }
        }

        if (role === "team_lead") {
        if (!validHrId) {
            return res.status(400).json({
            success: false,
            message:
                "A Team Lead must be assigned to an HR.",
            });
        }

        if (validTeamLeadId) {
            return res.status(400).json({
            success: false,
            message:
                "A Team Lead cannot be assigned to another Team Lead.",
            });
        }
        }

        if (role === "team_member") {
        if (!validTeamLeadId) {
            return res.status(400).json({
            success: false,
            message:
                "A Team Member must be assigned to a Team Lead.",
            });
        }

        /*
        * Automatically determine the HR
        * from the Team Lead.
        */
        const teamLead = await User.findById(validTeamLeadId);

        if (!teamLead || !teamLead.hrId) {
            return res.status(400).json({
            success: false,
            message:
                "The selected Team Lead is not assigned to an HR.",
            });
        }

        validHrId = teamLead.hrId;
        }

        /*
        * Hash password
        */
        const hashedPassword = await bcrypt.hash(
        password,
        12
        );

        /*
        * Create user
        */
        const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        projectIds: [],
        hrId: validHrId,
        teamLeadId: validTeamLeadId,
        isActive: true,
        });

        return res.status(201).json({
        success: true,
        message: "User created successfully.",
        user: getSafeUser(user),
        });
    } catch (error) {
        next(error);
    }
    };

    /*
    |--------------------------------------------------------------------------
    | GET ALL USERS
    |--------------------------------------------------------------------------
    */

    const getUsers = async (req, res, next) => {
    try {
        const {
        role,
        isActive,
        search,
        } = req.query;

        const filter = {};

        if (role) {
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
            success: false,
            message: "Invalid role filter.",
            });
        }

        filter.role = role;
        }

        if (isActive !== undefined) {
        filter.isActive = isActive === "true";
        }

        if (search) {
        filter.$or = [
            {
            name: {
                $regex: search,
                $options: "i",
            },
            },
            {
            email: {
                $regex: search,
                $options: "i",
            },
            },
        ];
        }

        const users = await User.find(filter)
        .select("-password")
        .populate("hrId", "name email role")
        .populate(
            "teamLeadId",
            "name email role"
        )
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

    /*
    |--------------------------------------------------------------------------
    | GET SINGLE USER
    |--------------------------------------------------------------------------
    */

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
        .populate(
            "hrId",
            "name email role"
        )
        .populate(
            "teamLeadId",
            "name email role"
        )
        .populate(
            "projectIds",
            "name code status"
        );

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

    /*
    |--------------------------------------------------------------------------
    | UPDATE USER
    |--------------------------------------------------------------------------
    */

    const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID.",
        });
        }

        const user = await User.findById(id).select("+password");

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
        hrId,
        teamLeadId,
        } = req.body;

        /*
        * Don't allow changing the primary
        * Admin's role.
        */
        if (
        user.role === "admin" &&
        role &&
        role !== "admin"
        ) {
        return res.status(400).json({
            success: false,
            message:
            "The Admin role cannot be changed.",
        });
        }

        if (name !== undefined) {
        if (!name.trim()) {
            return res.status(400).json({
            success: false,
            message: "Name cannot be empty.",
            });
        }

        user.name = name.trim();
        }

        if (email !== undefined) {
        const normalizedEmail =
            email.toLowerCase().trim();

        const duplicate = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id },
        });

        if (duplicate) {
            return res.status(409).json({
            success: false,
            message:
                "Another user already uses this email.",
            });
        }

        user.email = normalizedEmail;
        }

        if (password !== undefined) {
        if (password.length < 6) {
            return res.status(400).json({
            success: false,
            message:
                "Password must be at least 6 characters.",
            });
        }

        user.password = await bcrypt.hash(
            password,
            12
        );
        }

        /*
        * Role update
        */
        if (role !== undefined) {
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
            success: false,
            message: "Invalid role.",
            });
        }

        user.role = role;
        }

        /*
        * Hierarchy update
        */
        if (user.role === "team_lead") {
        if (!hrId) {
            return res.status(400).json({
            success: false,
            message:
                "A Team Lead must have an HR.",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(hrId)) {
            return res.status(400).json({
            success: false,
            message: "Invalid HR ID.",
            });
        }

        const hr = await User.findOne({
            _id: hrId,
            role: "hr",
            isActive: true,
        });

        if (!hr) {
            return res.status(400).json({
            success: false,
            message:
                "Selected HR does not exist or is inactive.",
            });
        }

        user.hrId = hr._id;
        user.teamLeadId = null;
        }

        if (user.role === "team_member") {
        if (!teamLeadId) {
            return res.status(400).json({
            success: false,
            message:
                "A Team Member must have a Team Lead.",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(
            teamLeadId
            )
        ) {
            return res.status(400).json({
            success: false,
            message:
                "Invalid Team Lead ID.",
            });
        }

        const teamLead = await User.findOne({
            _id: teamLeadId,
            role: "team_lead",
            isActive: true,
        });

        if (!teamLead) {
            return res.status(400).json({
            success: false,
            message:
                "Selected Team Lead does not exist or is inactive.",
            });
        }

        user.teamLeadId = teamLead._id;
        user.hrId = teamLead.hrId;
        }

        if (
        user.role === "hr" ||
        user.role === "admin"
        ) {
        user.hrId = null;
        user.teamLeadId = null;
        }

        await user.save();

        return res.status(200).json({
        success: true,
        message: "User updated successfully.",
        user: getSafeUser(user),
        });
    } catch (error) {
        next(error);
    }
    };

    /*
    |--------------------------------------------------------------------------
    | ACTIVATE / DEACTIVATE USER
    |--------------------------------------------------------------------------
    */

    const updateUserStatus = async (
    req,
    res,
    next
    ) => {
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
            message:
            "isActive must be true or false.",
        });
        }

        const user = await User.findById(id);

        if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found.",
        });
        }

        /*
        * Never deactivate yourself.
        */
        if (
        req.user._id.toString() ===
        user._id.toString()
        ) {
        return res.status(400).json({
            success: false,
            message:
            "You cannot change your own account status.",
        });
        }

        user.isActive = isActive;

        await user.save();

        return res.status(200).json({
        success: true,
        message: isActive
            ? "User activated successfully."
            : "User deactivated successfully.",
        user: getSafeUser(user),
        });
    } catch (error) {
        next(error);
    }
    };

    /*
    |--------------------------------------------------------------------------
    | DELETE USER
    |--------------------------------------------------------------------------
    */

    const deleteUser = async (req, res, next) => {
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

        /*
        * Never delete yourself.
        */
        if (
        req.user._id.toString() ===
        user._id.toString()
        ) {
        return res.status(400).json({
            success: false,
            message:
            "You cannot delete your own account.",
        });
        }

        /*
        * Don't delete Admin accounts through
        * the normal user endpoint.
        */
        if (user.role === "admin") {
        return res.status(403).json({
            success: false,
            message:
            "Admin accounts cannot be deleted from this endpoint.",
        });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
        success: true,
        message: "User deleted successfully.",
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