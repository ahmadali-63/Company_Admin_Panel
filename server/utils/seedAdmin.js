    const dotenv = require("dotenv");
    const bcrypt = require("bcryptjs");

    const connectDB = require("../config/db");
    const User = require("../models/User");

    dotenv.config();

    const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({
        role: "admin",
        });

        if (existingAdmin) {
        console.log("Admin account already exists.");
        process.exit(0);
        }

        const password = process.env.ADMIN_PASSWORD;

        if (!password) {
        console.error(
            "ADMIN_PASSWORD is missing from the .env file."
        );
        process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const admin = await User.create({
        name: "System Administrator",
        email: process.env.ADMIN_EMAIL || "admin@company.com",
        password: hashedPassword,
        role: "admin",
        projectIds: [],
        hrId: null,
        teamLeadId: null,
        isActive: true,
        });

        console.log("Admin account created successfully.");
        console.log(`Email: ${admin.email}`);

        process.exit(0);
    } catch (error) {
        console.error("Failed to create Admin:");
        console.error(error.message);

        process.exit(1);
    }
    };

    seedAdmin();