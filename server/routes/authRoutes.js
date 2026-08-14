const express = require("express");
const { login, signup } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/login", login);
router.post("/signup", signup);
router.post("/register", signup);

// Any authenticated user
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication successful",
    user: req.user,
  });
});

module.exports = router;