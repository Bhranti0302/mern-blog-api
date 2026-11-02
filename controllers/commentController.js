const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose")

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

  // Validate comment content
  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: "Comment content is required",
    });
  }

  // Create comment
  const comment = await Comment.create({
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

// ------------- Get All Comment as per blog id ------------
const getAllComments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const skip = (page - 1) * limit;

  // Check whether blog exists
  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  // Fetch comments
  const comments = await Comment.find({ blog: id })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Count total comments
  const totalComments = await Comment.countDocuments({ blog: id });

  const totalPages = Math.ceil(totalComments / limit);

  res.status(200).json({
    success: true,
    message: "Comments fetched successfully",
    results: comments.length,
    totalComments,
    currentPage: page,
    totalPages,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    comments,
  });
});

// -------------------- For both ------------------------

// Update comment 
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  // Validate Comment ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID",
    });
  }

  // Build filter
  const filter = { _id: id };

  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  // Build update object
  const updates = {};

  if (content !== undefined) {
    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content cannot be empty",
      });
    }

    updates.content = content.trim();
  }

  // Check whether update data exists
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please provide content to update",
    });
  }

  // Update comment
  const comment = await Comment.findOneAndUpdate(
    filter,
    { $set: updates },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found or you are not authorized",
    });
  }

  res.status(200).json({
    success: true,
    message: "Comment updated successfully",
    comment: {
      id: comment._id,
      content: comment.content,
    },
  });
});

// Delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate Comment ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid comment ID",
    });
  }

  // Build filter
  const filter = { _id: id };

  // Regular users can delete only their own comments
  // Admins can delete any comment
  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  // Delete comment
  const comment = await Comment.findOneAndDelete(filter);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found or you are not authorized to delete it",
    });
  }

  // Decrease blog comments count
  await Blog.findByIdAndUpdate(comment.blog, {
    $inc: { commentsCount: -1 },
  });

  res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
});



module.exports = { createComment, getAllComments, updateComment };

