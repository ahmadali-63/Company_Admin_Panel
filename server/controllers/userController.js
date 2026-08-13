    const bcrypt = require("bcryptjs");
    const User = require("../models/User");

    const createUser = async (req, res, next) => {
    try {
        const {
        name,
        email,
        password,
        role,
        projectIds = [],
        hrId = null,
        teamLeadId = null,
        } = req.body;

        // Basic required fields
        if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password and role are required.",
        });
        }

        // Validate role
        const allowedRoles = [
        "admin",
        "hr",
        "team_lead",
        "team_member",
        ];

        if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid user role.",
        });
        }

        // Only Admin can use this endpoint for now.
        // Role middleware also protects the route.
        if (role === "admin" && req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Only an Admin can create another Admin.",
        });
        }

        // Check duplicate email
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

        // Validate HR relationship
        let validHrId = null;

        if (hrId) {
        const hr = await User.findOne({
            _id: hrId,
            role: "hr",
            isActive: true,
        });

        if (!hr) {
            return res.status(400).json({
            success: false,
            message: "The selected HR does not exist or is inactive.",
            });
        }

        validHrId = hr._id;
        }

        // Validate Team Lead relationship
        let validTeamLeadId = null;

        if (teamLeadId) {
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
        }

        // Team Members must have a Team Lead
        if (role === "team_member" && !validTeamLeadId) {
        return res.status(400).json({
            success: false,
            message: "A Team Member must be assigned to a Team Lead.",
        });
        }

        // Team Leads must have an HR
        if (role === "team_lead" && !validHrId) {
        return res.status(400).json({
            success: false,
            message: "A Team Lead must be assigned to an HR.",
        });
        }

        // HR should not have an HR or Team Lead parent
        if (role === "hr" && (validHrId || validTeamLeadId)) {
        return res.status(400).json({
            success: false,
            message: "An HR cannot be assigned to another HR or Team Lead.",
        });
        }

        // Admin should not be assigned under HR/Team Lead
        if (role === "admin" && (validHrId || validTeamLeadId)) {
        return res.status(400).json({
            success: false,
            message: "An Admin cannot be assigned under HR or Team Lead.",
        });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        projectIds,
        hrId: validHrId,
        teamLeadId: validTeamLeadId,
        isActive: true,
        });

        // Never return password
        const safeUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        projectIds: user.projectIds,
        hrId: user.hrId,
        teamLeadId: user.teamLeadId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        };

        return res.status(201).json({
        success: true,
        message: "User created successfully.",
        user: safeUser,
        });
    } catch (error) {
        next(error);
    }
    };

    module.exports = {
    createUser,
    };