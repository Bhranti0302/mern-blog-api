const express = require("express");
const router = express.Router();

// Import controllers
const { signup, login, logout } = require("../controllers/authController");

// Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
