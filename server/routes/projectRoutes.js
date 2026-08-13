    const express = require("express");

    const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    assignHR,
    removeHR,
    } = require("../controllers/projectController");

    const {
    protect,
    } = require("../middleware/authMiddleware");

    const {
    authorizeRoles,
    } = require("../middleware/roleMiddleware");

    const router = express.Router();

    /*
    |--------------------------------------------------------------------------
    | PROJECT ROUTES
    |--------------------------------------------------------------------------
    */

    /*
    * Create project
    * Admin only
    */
    router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createProject
    );

    /*
    * Get projects
    * Admin only for now
    */
    router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    getProjects
    );

    /*
    * Get one project
    */
    router.get(
    "/:id",
    protect,
    authorizeRoles("admin"),
    getProjectById
    );

    /*
    * Update project
    */
    router.patch(
    "/:id",
    protect,
    authorizeRoles("admin"),
    updateProject
    );

    /*
    * Assign HR
    */
    router.post(
    "/:id/hr",
    protect,
    authorizeRoles("admin"),
    assignHR
    );

    /*
    * Remove HR
    */
    router.delete(
    "/:id/hr",
    protect,
    authorizeRoles("admin"),
    removeHR
    );

    module.exports = router;