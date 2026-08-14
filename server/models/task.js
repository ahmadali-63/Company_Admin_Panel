    const mongoose = require("mongoose");

    const taskSchema = new mongoose.Schema(
    {
        title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
        },
        description: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
        },
        projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        },
        assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        status: {
        type: String,
        enum: ["pending", "in_progress", "completed", "cancelled"],
        default: "pending",
        },
        priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium",
        },
        dueDate: {
        type: Date,
        default: null,
        },
        completedAt: {
        type: Date,
        default: null,
        },
    },
    {
        timestamps: true,
    }
    );

    taskSchema.index({ projectId: 1, assignedTo: 1 });
    taskSchema.index({ status: 1 });

    module.exports = mongoose.model("Task", taskSchema);