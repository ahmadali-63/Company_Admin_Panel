    const jwt = require("jsonwebtoken");
    const User = require("../models/User");

    const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please provide a valid token.",
        });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing.",
        });
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find current user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
        return res.status(401).json({
            success: false,
            message: "User associated with this token no longer exists.",
        });
        }

        // Prevent inactive users from accessing protected APIs
        if (!user.isActive) {
        return res.status(403).json({
            success: false,
            message: "Your account is inactive.",
        });
        }

        // Attach authenticated user to request
        req.user = user;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Your session has expired. Please log in again.",
        });
        }

        if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid authentication token.",
        });
        }

        next(error);
    }
    };

    module.exports = {
    protect,
    };