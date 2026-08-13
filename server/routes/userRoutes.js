    const express = require("express");

    const { createUser } = require("../controllers/userController");
    const { protect } = require("../middleware/authMiddleware");
    const { authorizeRoles } = require("../middleware/roleMiddleware");

    const router = express.Router();

    // Admin-only user creation
    router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createUser
    );

    module.exports = router;