    const mongoose = require("mongoose");

    const projectSchema = new mongoose.Schema(
    {
        name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
        },

        code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: 50,
        },

        description: {
        type: String,
        trim: true,
        default: "",
        maxlength: 2000,
        },

        status: {
        type: String,
        enum: [
            "planning",
            "active",
            "on_hold",
            "completed",
            "cancelled",
        ],
        default: "planning",
        },

        startDate: {
        type: Date,
        default: null,
        },

        endDate: {
        type: Date,
        default: null,
        },

        createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },

        hrIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        ],

        teamLeadIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        ],

        memberIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        ],

        isActive: {
        type: Boolean,
        default: true,
        },
    },
    {
        timestamps: true,
    }
    );

    projectSchema.index({
    status: 1,
    });

    projectSchema.index({
    hrIds: 1,
    });

    projectSchema.index({
    teamLeadIds: 1,
    });

    projectSchema.index({
    memberIds: 1,
    });

    module.exports = mongoose.model(
    "Project",
    projectSchema
    );