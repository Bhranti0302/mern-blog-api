const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Blog = require("../models/Blog");
const mongoose = require("mongoose");

// ------------------ For logged in users only ------------------

// Create Blog
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  const blog = await Blog.create({
    title,
    content,
    category,
    tags,
    author: user._id,
  });

  res.status(200).json({
    success: true,
    message: "Blog created successfully",
    blog: {
      id: blog._id,
      title: blog.title,
      content: blog.content,
      category: blog.category,
      tags: blog.tags,
      author: blog.author,
    },
  });
});

// Update Blog
const updateBlog = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  if (
    title === undefined &&
    content === undefined &&
    category === undefined &&
    tags === undefined
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one field to update",
    });
  }

  let updateData = {};

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (tags !== undefined) updateData.tags = tags;

  const blog = await Blog.findByIdAndUpdate(
    {
      _id: req.params.id,
      author: req.user._id,
    },
    {
      $set: updateData,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found or you are not authorized to update this blog",
    });
  }

  res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    blog: {
      id: blog._id,
      title: blog.title,
      content: blog.content,
      category: blog.category,
      tags: blog.tags,
    },
  });
});

// Delete Blog
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found or you are not authorized to delete this blog",
    });
  }

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

const getMyBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    author: req.user._id,
  }).populate("author", "name email");

  res.status(200).json({
    success: true,
    message: "Blogs fetched successfully",
    totalBlogs: blogs.length,
    blogs,
  });
});

// -------------------- For All Users ---------------------

const getAllBlogs = asyncHandler(async (req, res) => {
  // 1. Pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const skip = (page - 1) * limit;

  // 2. Get query parameters
  const { search, category, tag, sort } = req.query;

  // 3. Build filter object
  const filter = {};

  // 4. Search by title and content
  if (search && search.trim()) {
    const searchText = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      {
        title: {
          $regex: searchText,
          $options: "i",
        },
      },
      {
        content: {
          $regex: searchText,
          $options: "i",
        },
      },
    ];
  }

  // 5. Filter by category
  if (category && category.trim()) {
    filter.category = category.trim().toLowerCase();
  }

  // 6. Filter by tag
  if (tag && tag.trim()) {
    filter.tags = tag.trim().toLowerCase();
  }

  // 7. Dynamic sorting
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    mostLiked: { likesCount: -1, createdAt: -1 },
    leastLiked: { likesCount: 1, createdAt: -1 },
  };

  const sortBy = sortOptions[sort] || sortOptions.newest;

  // 8. Count matching blogs
  const totalBlogs = await Blog.countDocuments(filter);

  // 9. Fetch blogs
  const blogs = await Blog.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate("author", "name email");

  // 10. Pagination information
  const totalPages = Math.ceil(totalBlogs / limit);

  // 11. Send response
  res.status(200).json({
    success: true,
    message: "Blogs fetched successfully",
    results: blogs.length,

    currentPage: page,
    totalPages,
    totalBlogs,
    limit,

    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,

    blogs,
  });
});

// ----------------- For All Users -------------------
const deleteBlogByAdmin = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

const toggleBlogLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate Blog ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  const userId = req.user._id;

  // Find Blog
  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  // Check whether user already liked the blog
  const isLiked = blog.likes.some(
    (likeId) => likeId.toString() === userId.toString(),
  );

  let updatedBlog;

  if (isLiked) {
    // Unlike Blog
    updatedBlog = await Blog.findOneAndUpdate(
      { _id: id, likes: userId },
      {
        $pull: { likes: userId },
      },
      { new: true },
    );
  } else {
    // Like Blog
    updatedBlog = await Blog.findOneAndUpdate(
      { _id: id, likes: { $ne: userId } },
      {
        $addToSet: { likes: userId },
      },
      { new: true },
    );
  }

  // Calculate likes count from likes array
  updatedBlog.likesCount = updatedBlog.likes.length;

  await updatedBlog.save();

  return res.status(200).json({
    success: true,
    message: isLiked ? "Blog unliked successfully" : "Blog liked successfully",
    likesCount: updatedBlog.likesCount,
    isLiked: !isLiked,
  });
});

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getMyBlogs,
  deleteBlogByAdmin,
  toggleBlogLike,
};
