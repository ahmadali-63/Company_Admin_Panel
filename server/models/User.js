    const mongoose = require("mongoose");

    const userSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [100, "Name cannot exceed 100 characters"],
        },

        email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address",
        ],
        },

        password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
        },

        role: {
        type: String,
        enum: ["admin", "hr", "team_lead", "team_member"],
        required: [true, "Role is required"],
        },

        projectIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },
        ],

        hrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        },

        teamLeadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        },

        isActive: {
        type: Boolean,
        default: true,
        },

        lastLogin: {
        type: Date,
        default: null,
        },
    },
    {
        timestamps: true,
    }
    );

    const User = mongoose.model("User", userSchema);

    module.exports = User;