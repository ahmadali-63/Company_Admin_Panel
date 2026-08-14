    const jwt = require("jsonwebtoken");
    const User = require("../models/User");

    const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (
        !authHeader ||
        !authHeader.startsWith("Bearer ")
        ) {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing.",
        });
        }

        const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
        );

        const user = await User.findById(
        decoded.userId
        ).select("-password");

        if (!user) {
        return res.status(401).json({
            success: false,
            message: "User account not found.",
        });
        }

        if (user.isActive === false) {
        return res.status(403).json({
            success: false,
            message: "Your account is inactive.",
        });
        }

        req.user = user;

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired.",
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