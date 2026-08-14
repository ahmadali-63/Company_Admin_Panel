    const dotenv = require("dotenv");
    const mongoose = require("mongoose");
    const bcrypt = require("bcryptjs");

    const connectDB = require("../config/db");
    const User = require("../models/User");

    dotenv.config();

    const ADMIN = {
    name: "System Administrator",
    email: "admin@example.com",
    password: "Admin@12345",
    role: "admin",
    phone: "1234567890",
    department: "Administration",
    designation: "System Admin",
    };

    const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ email: ADMIN.email });

        if (existingAdmin) {
        console.log("Admin account already exists.");
        await mongoose.connection.close();
        process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(ADMIN.password, 12);

        await User.create({
        name: ADMIN.name,
        email: ADMIN.email,
        password: hashedPassword,
        role: ADMIN.role,
        phone: ADMIN.phone,
        department: ADMIN.department,
        designation: ADMIN.designation,
        hrId: null,
        teamLeadId: null,
        projectIds: [],
        isActive: true,
        });

        console.log("Admin created successfully.");
        console.log(`Email: ${ADMIN.email}`);
        console.log(`Password: ${ADMIN.password}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Admin seed failed:", error);
        if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        }
        process.exit(1);
    }
    };

    seedAdmin();