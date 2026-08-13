    const express = require("express");
    const dotenv = require("dotenv");

    const connectDB = require("./config/db");
    const userRoutes = require("./routes/userRoutes");
    const authRoutes = require("./routes/authRoutes");
    const errorMiddleware = require("./middleware/errorMiddleware");
    const projectRoutes = require("./routes/projectRoutes");

    dotenv.config();

    const app = express();

    const PORT = process.env.PORT || 5000;

    // Database
    connectDB();

    // Body parser
    app.use(express.json());

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/projects", projectRoutes);

    // Health check
    app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Company Admin Panel API is running",
    });
    });
    app.get("/abc", (req, res) => {
    res.status(200).json({
        success: true,
        message: "abc",
    });
    });

    // Error handler — must be after routes
    app.use(errorMiddleware);

    // Start server
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    });