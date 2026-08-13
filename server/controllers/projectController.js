    const mongoose = require("mongoose");
    const Project = require("../models/Project");
    const User = require("../models/User");

    const allowedStatuses = [
    "active",
    "completed",
    "on_hold",
    "cancelled",
    ];

    /*
    |--------------------------------------------------------------------------
    | CREATE PROJECT
    |--------------------------------------------------------------------------
    */

    const createProject = async (req, res, next) => {
    try {
        const {
        name,
        code,
        description = "",
        status = "active",
        startDate,
        endDate = null,
        } = req.body;

        if (!name || !code || !startDate) {
        return res.status(400).json({
            success: false,
            message:
            "Project name, code and start date are required.",
        });
        }

        if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project status.",
        });
        }

        const normalizedCode = code.trim().toUpperCase();

        const existingProject = await Project.findOne({
        code: normalizedCode,
        });

        if (existingProject) {
        return res.status(409).json({
            success: false,
            message:
            "A project with this code already exists.",
        });
        }

        const parsedStartDate = new Date(startDate);

        if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid start date.",
        });
        }

        let parsedEndDate = null;

        if (endDate) {
        parsedEndDate = new Date(endDate);

        if (Number.isNaN(parsedEndDate.getTime())) {
            return res.status(400).json({
            success: false,
            message: "Invalid end date.",
            });
        }

        if (parsedEndDate < parsedStartDate) {
            return res.status(400).json({
            success: false,
            message:
                "End date cannot be earlier than start date.",
            });
        }
        }

        const project = await Project.create({
        name: name.trim(),
        code: normalizedCode,
        description: description.trim(),
        status,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        hrIds: [],
        createdBy: req.user._id,
        isActive: status === "active",
        });

        const populatedProject = await Project.findById(
        project._id
        )
        .populate(
            "createdBy",
            "name email role"
        )
        .populate(
            "hrIds",
            "name email role"
        );

        return res.status(201).json({
        success: true,
        message: "Project created successfully.",
        project: populatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    /*
    |--------------------------------------------------------------------------
    | GET ALL PROJECTS
    |--------------------------------------------------------------------------
    */

    const getProjects = async (req, res, next) => {
    try {
        const { status, search } = req.query;

        const filter = {};

        if (status) {
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
            success: false,
            message: "Invalid status filter.",
            });
        }

        filter.status = status;
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
            code: {
                $regex: search,
                $options: "i",
            },
            },
        ];
        }

        const projects = await Project.find(filter)
        .populate(
            "createdBy",
            "name email role"
        )
        .populate(
            "hrIds",
            "name email role"
        )
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

    /*
    |--------------------------------------------------------------------------
    | GET PROJECT BY ID
    |--------------------------------------------------------------------------
    */

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
        .populate(
            "createdBy",
            "name email role"
        )
        .populate(
            "hrIds",
            "name email role"
        );

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

    /*
    |--------------------------------------------------------------------------
    | UPDATE PROJECT
    |--------------------------------------------------------------------------
    */

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

        const {
        name,
        code,
        description,
        status,
        startDate,
        endDate,
        } = req.body;

        if (name !== undefined) {
        if (!name.trim()) {
            return res.status(400).json({
            success: false,
            message: "Project name cannot be empty.",
            });
        }

        project.name = name.trim();
        }

        if (code !== undefined) {
        const normalizedCode = code
            .trim()
            .toUpperCase();

        const duplicate = await Project.findOne({
            code: normalizedCode,
            _id: { $ne: project._id },
        });

        if (duplicate) {
            return res.status(409).json({
            success: false,
            message:
                "Another project already uses this code.",
            });
        }

        project.code = normalizedCode;
        }

        if (description !== undefined) {
        project.description = description.trim();
        }

        if (status !== undefined) {
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
            success: false,
            message: "Invalid project status.",
            });
        }

        project.status = status;
        project.isActive = status === "active";
        }

        if (startDate !== undefined) {
        const newStartDate = new Date(startDate);

        if (Number.isNaN(newStartDate.getTime())) {
            return res.status(400).json({
            success: false,
            message: "Invalid start date.",
            });
        }

        project.startDate = newStartDate;
        }

        if (endDate !== undefined) {
        if (endDate === null || endDate === "") {
            project.endDate = null;
        } else {
            const newEndDate = new Date(endDate);

            if (Number.isNaN(newEndDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid end date.",
            });
            }

            if (newEndDate < project.startDate) {
            return res.status(400).json({
                success: false,
                message:
                "End date cannot be earlier than start date.",
            });
            }

            project.endDate = newEndDate;
        }
        }

        await project.save();

        const updatedProject = await Project.findById(
        project._id
        )
        .populate(
            "createdBy",
            "name email role"
        )
        .populate(
            "hrIds",
            "name email role"
        );

        return res.status(200).json({
        success: true,
        message: "Project updated successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    /*
    |--------------------------------------------------------------------------
    | ASSIGN HR TO PROJECT
    |--------------------------------------------------------------------------
    */

    const assignHR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hrId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID.",
        });
        }

        if (!hrId || !mongoose.Types.ObjectId.isValid(hrId)) {
        return res.status(400).json({
            success: false,
            message: "A valid HR ID is required.",
        });
        }

        const project = await Project.findById(id);

        if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found.",
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

        const alreadyAssigned = project.hrIds.some(
        (existingHrId) =>
            existingHrId.toString() ===
            hr._id.toString()
        );

        if (alreadyAssigned) {
        return res.status(409).json({
            success: false,
            message:
            "This HR is already assigned to the project.",
        });
        }

        /*
        * Add HR to project.
        */
        project.hrIds.push(hr._id);

        /*
        * Add project to HR.
        */
        if (
        !hr.projectIds.some(
            (projectId) =>
            projectId.toString() ===
            project._id.toString()
        )
        ) {
        hr.projectIds.push(project._id);
        }

        await project.save();
        await hr.save();

        const updatedProject = await Project.findById(
        project._id
        )
        .populate(
            "createdBy",
            "name email role"
        )
        .populate(
            "hrIds",
            "name email role"
        );

        return res.status(200).json({
        success: true,
        message: "HR assigned to project successfully.",
        project: updatedProject,
        });
    } catch (error) {
        next(error);
    }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE HR FROM PROJECT
    |--------------------------------------------------------------------------
    */

    const removeHR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hrId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid project ID.",
        });
        }

        if (!hrId || !mongoose.Types.ObjectId.isValid(hrId)) {
        return res.status(400).json({
            success: false,
            message: "A valid HR ID is required.",
        });
        }

        const project = await Project.findById(id);

        if (!project) {
        return res.status(404).json({
            success: false,
            message: "Project not found.",
        });
        }

        const hr = await User.findOne({
        _id: hrId,
        role: "hr",
        });

        if (!hr) {
        return res.status(404).json({
            success: false,
            message: "HR not found.",
        });
        }

        project.hrIds = project.hrIds.filter(
        (existingHrId) =>
            existingHrId.toString() !==
            hr._id.toString()
        );

        hr.projectIds = hr.projectIds.filter(
        (projectId) =>
            projectId.toString() !==
            project._id.toString()
        );

        await project.save();
        await hr.save();

        return res.status(200).json({
        success: true,
        message: "HR removed from project successfully.",
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
    };