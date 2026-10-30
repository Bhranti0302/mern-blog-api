const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { getMe } = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMe);

module.exports = router;
