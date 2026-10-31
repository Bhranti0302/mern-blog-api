const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");
const {
  getMe,
  updateMe,
  deleteMe,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// For logged User
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.delete("/me", protect, deleteMe);

// Admin
router.get("/", protect, restrictTo("admin"), getAllUsers);
router.put("/:id", protect, restrictTo("admin"), updateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

module.exports = router;
