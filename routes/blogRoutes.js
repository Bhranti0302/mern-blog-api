const express = require("express");

const {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogById,
  deleteBlogByAdmin,
  toggleBlogLike,
} = require("../controllers/blogController");

const {
  createComment,
  getAllComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");

const { protect } = require("../middlewares/authMiddleware");
const { restrictTo } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// ------------------ Logged In Users ------------------

// Get My Blogs
router.get("/my-blogs", protect, getMyBlogs);

// Create Blog
router.post("/", protect, upload.single("coverImage"), createBlog);

// Update Blog
router.put("/:id", protect, upload.single("coverImage"), updateBlog);

// Delete Blog
router.delete("/:id", protect, deleteBlog);

// Toggle Blog Like
router.put("/:id/like", protect, toggleBlogLike);

// ------------------ All Users ------------------

// Get All Blogs
router.get("/", getAllBlogs);

// Get Single Blog
router.get("/:id", getBlogById);

// ------------------ Admin ------------------

// Admin Delete Blog
router.delete("/admin/:id", protect, restrictTo("admin"), deleteBlogByAdmin);

// ------------------ Comments ------------------

// Create Comment
router.post("/:id/comments", protect, createComment);

// Get All Comments
router.get("/:id/comments", getAllComments);

// Update Comment
router.put("/comments/:id", protect, updateComment);

// Delete Comment
router.delete("/comments/:id", protect, deleteComment);

module.exports = router;
