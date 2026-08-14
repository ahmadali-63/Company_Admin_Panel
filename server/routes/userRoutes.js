    const express = require("express");

    const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    updateUserStatus,
    deleteUser,
    } = require("../controllers/userController");

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
    authorizeRoles("admin"),
    createUser
    );

    router.get(
    "/",
    protect,
    authorizeRoles(
        "admin",
        "hr",
        "team_lead"
    ),
    getUsers
    );

    router.get(
    "/:id",
    protect,
    authorizeRoles(
        "admin",
        "hr",
        "team_lead"
    ),
    getUserById
    );

    router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateUser
    );

    router.patch(
    "/:id/status",
    protect,
    authorizeRoles("admin"),
    updateUserStatus
    );

    router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    deleteUser
    );

    module.exports = router;