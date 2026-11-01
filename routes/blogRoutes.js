const express = require("express");

const {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getMyBlogs,
    deleteBlogByAdmin,
    toggleBlogLike,
} = require("../controllers/blogController");
const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");

const router = express.Router();

// ------------------ For logged in users only ------------------
router.get("/my-blogs", protect, getMyBlogs);
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);
router.put("/:id/like", protect, toggleBlogLike);

// -------------------- For All Users ---------------------
router.get("/", protect, getAllBlogs);

// -------------------- For Admin ---------------------
router.delete("/admin/:id", protect, restrictTo("admin"), deleteBlogByAdmin);

module.exports = router;
