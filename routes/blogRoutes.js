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

const { createComment,getAllComments,updateComment } = require("../controllers/commentController");

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

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);

// -------------------- For Admin ---------------------

router.delete("/admin/:id", protect, restrictTo("admin"), deleteBlogByAdmin);

// ------------------ Comments --------------------

router.post("/:id/comments", protect, createComment);
router.get("/:id/comments", getAllComments);
router.put("/comments/:id",protect,updateComment)

module.exports = router;
