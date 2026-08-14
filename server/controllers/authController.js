const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { SUCCESS_MESSAGES } = require("../utils/constants/messages.js");

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive. Please contact your administrator.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      projectIds: user.projectIds,
      hrId: user.hrId,
      teamLeadId: user.teamLeadId,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const targetRole = role && ["admin", "hr", "team_lead", "team_member"].includes(role) ? role : "team_member";

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password, // Pre-save hook in User model will hash this
      role: targetRole,
      phone: phone || "",
      department: department || "",
      designation: designation || "",
      isActive: true,
    });

    const token = generateToken(newUser._id.toString());

    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      designation: newUser.designation,
      phone: newUser.phone,
      isActive: newUser.isActive,
    };

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  signup,
};