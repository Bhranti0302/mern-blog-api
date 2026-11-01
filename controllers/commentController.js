const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const { createBlog } = require("./blogController");

// Create comment
const createComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  // Check if blog exists
  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  // Create comment
  const comment = await comment.create({
    blog: id,
    user: req.user._id,
    content,
  });

  // Increase comments count
  await Blog.findByIdAndUpdate(id, {
    $inc: { commentsCount: 1 },
  });

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    comment: {
      id: comment._id,
      content: comment.content,
    },
  });
});

module.exports = {createBlog}