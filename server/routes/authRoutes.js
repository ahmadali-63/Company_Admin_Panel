    const express = require("express");

    const { login } = require("../controllers/authController");
    const { protect } = require("../middleware/authMiddleware");
    const { authorizeRoles } = require("../middleware/roleMiddleware");

    const router = express.Router();

    // Public
    router.post("/login", login);

    // Any authenticated user
    router.get("/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        },
    });
    });

    // Admin only
    router.get(
    "/admin-test",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        res.status(200).json({
        success: true,
        message: "Admin authorization successful.",
        role: req.user.role,
        });
    }
    );

    // Admin and HR
    router.get(
    "/management-test",
    protect,
    authorizeRoles("admin", "hr"),
    (req, res) => {
        res.status(200).json({
        success: true,
        message: "Management authorization successful.",
        role: req.user.role,
        });
    }
    );

    module.exports = router;