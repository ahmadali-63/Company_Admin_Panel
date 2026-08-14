    const errorMiddleware = (
    error,
    req,
    res,
    next
    ) => {
    console.error("ERROR:", error);

    if (error.name === "ValidationError") {
        return res.status(400).json({
        success: false,
        message: "Validation error.",
        errors: Object.values(
            error.errors
        ).map((err) => err.message),
        });
    }

    if (error.name === "CastError") {
        return res.status(400).json({
        success: false,
        message: "Invalid ID.",
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
        success: false,
        message:
            "A record with this value already exists.",
        });
    }

    return res.status(500).json({
        success: false,
        message:
        process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error.",
    });
    };

    module.exports = errorMiddleware;