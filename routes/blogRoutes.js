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
const { summarizeBlog } = require("../controllers/aiController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Blogs
 *     description: Blog management APIs
 *   - name: Comments
 *     description: Blog comment APIs
 *   - name: AI
 *     description: AI-powered blog features
 */

// =====================================================
// BLOG ROUTES
// =====================================================

/**
 * @swagger
 * /api/blog:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
router.get("/", getAllBlogs);

/**
 * @swagger
 * /api/blog/my-blogs:
 *   get:
 *     summary: Get logged-in user's blogs
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User blogs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-blogs", protect, getMyBlogs);

/**
 * @swagger
 * /api/blog:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Understanding JavaScript
 *               content:
 *                 type: string
 *                 example: JavaScript is a programming language...
 *               category:
 *                 type: string
 *                 example: Technology
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - JavaScript
 *                   - Programming
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Invalid blog data
 *       401:
 *         description: Unauthorized
 */
router.post("/", protect, upload.single("coverImage"), createBlog);

/**
 * @swagger
 * /api/blog/{id}:
 *   get:
 *     summary: Get a single blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get("/:id", getBlogById);

/**
 * @swagger
 * /api/blog/{id}:
 *   put:
 *     summary: Update a blog
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 */
router.put("/:id", protect, upload.single("coverImage"), updateBlog);

/**
 * @swagger
 * /api/blog/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 */
router.delete("/:id", protect, deleteBlog);

/**
 * @swagger
 * /api/blog/{id}/like:
 *   put:
 *     summary: Toggle blog like
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog like status updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 */
router.put("/:id/like", protect, toggleBlogLike);

/**
 * @swagger
 * /api/blog/admin/{id}:
 *   delete:
 *     summary: Delete a blog as admin
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully by admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Blog not found
 */
router.delete("/admin/:id", protect, restrictTo("admin"), deleteBlogByAdmin);

// =====================================================
// COMMENT ROUTES
// =====================================================

/**
 * @swagger
 * /api/blog/{id}/comments:
 *   post:
 *     summary: Create a comment on a blog
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Great article!
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 */
router.post("/:id/comments", protect, createComment);

/**
 * @swagger
 * /api/blog/{id}/comments:
 *   get:
 *     summary: Get all comments for a blog
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       404:
 *         description: Blog not found
 */
router.get("/:id/comments", getAllComments);

/**
 * @swagger
 * /api/blog/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 example: Updated comment content
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.put("/comments/:id", protect, updateComment);

/**
 * @swagger
 * /api/blog/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.delete("/comments/:id", protect, deleteComment);

// =====================================================
// AI ROUTES
// =====================================================

/**
 * @swagger
 * /api/blog/{id}/summarize:
 *   post:
 *     summary: Generate an AI summary of a blog
 *     tags: [AI]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog summary generated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 *       502:
 *         description: AI service unavailable
 */
router.post("/:id/summarize", protect, summarizeBlog);

module.exports = router;
