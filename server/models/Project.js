    const mongoose = require("mongoose");

    const projectSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: [true, "Project name is required"],
        trim: true,
        minlength: [2, "Project name must be at least 2 characters"],
        maxlength: [150, "Project name cannot exceed 150 characters"],
        },

        description: {
        type: String,
        trim: true,
        maxlength: [1000, "Description cannot exceed 1000 characters"],
        default: "",
        },

        code: {
        type: String,
        required: [true, "Project code is required"],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [2, "Project code must be at least 2 characters"],
        maxlength: [30, "Project code cannot exceed 30 characters"],
        },

        status: {
        type: String,
        enum: ["active", "completed", "on_hold", "cancelled"],
        default: "active",
        },

        startDate: {
        type: Date,
        required: [true, "Project start date is required"],
        },

        endDate: {
        type: Date,
        default: null,
        },

        hrIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        ],

        createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Project creator is required"],
        },

        isActive: {
        type: Boolean,
        default: true,
        },
    },
    {
        timestamps: true,
    }
    );

    const Project = mongoose.model("Project", projectSchema);

    module.exports = Project;