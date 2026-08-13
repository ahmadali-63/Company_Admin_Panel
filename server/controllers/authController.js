    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    // import { SUCCESS_MESSAGES } from "../utils/constants/messages.js";
    const  SUCCESS_MESSAGES  = require("../utils/constants/messages.js");

    const generateToken = (userId) => {
    return jwt.sign(
        {
        userId,
        },
        process.env.JWT_SECRET,
        {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
    };

    const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        console.log("🚀 ~ login ~ email:", email)

    
        // Validate required fields
        if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
            email: email,
        });
        }


        // Find user and explicitly include password
        const user = await User.findOne({
        email: email.toLowerCase().trim(),
        }).select("+password");

        if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
        }

        // Check whether account is active
        if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message: "This account is inactive",
        });
        }

        // Compare entered password with stored hash
        const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
        );

        if (!isPasswordCorrect) {
        return res.status(401).json({
            success: false,
            message: SUCCESS_MESSAGES.INVALID_CREDENTIALS,
        });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT
        const token = generateToken(user._id.toString());

        // Don't send password to client
        const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        projectIds: user.projectIds,
        hrId: user.hrId,
        teamLeadId: user.teamLeadId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        };

        return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: userData,
        });
    } catch (error) {
        next(error);
    }
    };

    const signup = async (req, res, next) => {
        try {
            const { name, email, password, role } = req.body;

            // Validate required fields
            if (!name || !email || !password || !role) {
                return res.status(400).json({
                    success: false,
                    message: "Name, email, password, and role are required",
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create new user
            const newUser = await User.create({
                name,
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role,
                isActive: true,
            });

            return res.status(201).json({
                success: true,
                message: SUCCESS_MESSAGES.USER_CREATED_SUCCESSFULLY,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    module.exports = {
    login,
    signup
    };