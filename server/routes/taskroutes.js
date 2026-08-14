    const express = require("express");

    const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    } = require("../controllers/taskController");

    const {
    protect,
    } = require("../middleware/authMiddleware");

    const {
    authorizeRoles,
    } = require("../middleware/roleMiddleware");

    const router = express.Router();

    router.post(
    "/",
    protect,
    authorizeRoles(
        "admin",
        "hr",
        "team_lead"
    ),
    createTask
    );

    router.get(
    "/",
    protect,
    authorizeRoles(
        "admin",
        "hr",
        "team_lead",
        "team_member"
    ),
    getTasks
    );

    router.get(
    "/:id",
    protect,
    authorizeRoles(
        "admin",
        "hr",
        "team_lead",
        "team_member"
    ),
    getTaskById
    );

    router.put(
    "/:id",
    protect,
    authorizeRoles(
        "admin",
        "hr",
        "team_lead"
    ),
    updateTask
    );

    router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteTask
    );

    module.exports = router;