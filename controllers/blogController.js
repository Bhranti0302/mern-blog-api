const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Blog = require("../models/Blog");

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
    })
  }

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  })
})

const getMyBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    author: req.user._id,
  }).populate("author", "name email");

  res.status(200).json({
    success: true,
    message: "Blogs fetched successfully",
    totalBlogs: blogs.length,
    blogs
  })
})

// -------------------- For All Users ---------------------

const getAllBlogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const skip = (page - 1) * limit;

  const { search, category } = req.query;

  // Build filter object
  const filter = {};

  // Search by title and content
  if (search && search.trim()) {
    const searchText = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { title: { $regex: searchText, $options: "i" } },
      { content: { $regex: searchText, $options: "i" } },
    ];
  }

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Count matching blogs
  const totalBlogs = await Blog.countDocuments(filter);

  // Fetch blogs
  const blogs = await Blog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "name email");

  res.status(200).json({
    success: true,
    message: "Blogs fetched successfully",
    currentPage: page,
    totalPages: Math.ceil(totalBlogs / limit),
    totalBlogs,
    blogs,
  });
});

// -------------------- For All Users ---------------------
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
  })
})


module.exports = { createBlog, updateBlog, deleteBlog, getAllBlogs, getMyBlogs, deleteBlogByAdmin };
