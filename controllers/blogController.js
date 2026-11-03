const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const mongoose = require("mongoose");

const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");

// -------------------- Cloudinary Helper --------------------

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;

  return await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });
};

// -------------------- Tags Helper --------------------

// Convert form-data tags string into an array
const parseTags = (tags) => {
  if (tags === undefined || tags === null) {
    return [];
  }

  const tagArray = Array.isArray(tags) ? tags : [tags];

  return [
    ...new Set(
      tagArray
        .filter((tag) => typeof tag === "string")
        .flatMap((tag) => tag.split(","))
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
};

// ------------------ Create Blog ------------------

const createBlog = asyncHandler(async (req, res) => {
  const { title, content, category, tags } = req.body;

  console.log("Complete request body:", req.body);
  console.log("Received tags:", req.body.tags);
  console.log("Parsed tags:", parseTags(req.body.tags));

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  let uploadedImage = null;

  if (req.file) {
    uploadedImage = await uploadToCloudinary(req.file.buffer, "blogs");
  }

  try {
    const blog = await Blog.create({
      title,
      content,
      category,
      tags: parseTags(tags),
      author: user._id,
      coverImage: uploadedImage?.secure_url || null,
      coverImagePublicId: uploadedImage?.public_id || null,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: {
        id: blog._id,
        title: blog.title,
        content: blog.content,
        category: blog.category,
        tags: blog.tags,
        author: blog.author,
        coverImage: blog.coverImage,
        coverImagePublicId: blog.coverImagePublicId,
      },
    });
  } catch (error) {
    // Remove uploaded image if blog creation fails
    if (uploadedImage?.public_id) {
      try {
        await deleteCloudinaryImage(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up uploaded image:",
          cleanupError.message,
        );
      }
    }

    throw error;
  }
});

// ------------------ Update Blog ------------------

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, category, tags } = req.body;

  // Validate Blog ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  // Check whether any field was provided
  if (
    title === undefined &&
    content === undefined &&
    category === undefined &&
    tags === undefined &&
    !req.file
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least one field or cover image to update",
    });
  }

  // Find blog belonging to logged-in user
  const existingBlog = await Blog.findOne({
    _id: id,
    author: req.user._id,
  });

  if (!existingBlog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found or you are not authorized to update this blog",
    });
  }

  // Build update object
  const updateData = {};

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;

  if (tags !== undefined) {
    updateData.tags = parseTags(tags);
  }

  let uploadedImage = null;

  // Upload new cover image if provided
  if (req.file) {
    uploadedImage = await uploadToCloudinary(req.file.buffer, "blogs");

    updateData.coverImage = uploadedImage.secure_url;
    updateData.coverImagePublicId = uploadedImage.public_id;
  }

  let updatedBlog;

  try {
    updatedBlog = await Blog.findOneAndUpdate(
      {
        _id: id,
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

    if (!updatedBlog) {
      throw new Error("Blog update failed or blog is no longer available");
    }
  } catch (error) {
    // Remove new image if database update fails
    if (uploadedImage?.public_id) {
      try {
        await deleteCloudinaryImage(uploadedImage.public_id);
      } catch (cleanupError) {
        console.error("Failed to clean up new image:", cleanupError.message);
      }
    }

    throw error;
  }

  let imageCleanupFailed = false;

  // Delete old image after successful database update
  if (uploadedImage && existingBlog.coverImagePublicId) {
    try {
      await deleteCloudinaryImage(existingBlog.coverImagePublicId);
    } catch (error) {
      imageCleanupFailed = true;
      console.error("Failed to delete old image:", error.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Blog updated successfully",
    imageCleanupFailed,
    blog: {
      id: updatedBlog._id,
      title: updatedBlog.title,
      content: updatedBlog.content,
      category: updatedBlog.category,
      tags: updatedBlog.tags,
      coverImage: updatedBlog.coverImage,
      coverImagePublicId: updatedBlog.coverImagePublicId,
    },
  });
});

// ------------------ Delete Blog ------------------

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate Blog ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  // Only the blog author can delete their blog
  const blog = await Blog.findOneAndDelete({
    _id: id,
    author: req.user._id,
  });

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found or you are not authorized to delete this blog",
    });
  }

  // Delete all associated comments
  await Comment.deleteMany({
    blog: blog._id,
  });

  let imageCleanupFailed = false;

  // Delete cover image from Cloudinary
  if (blog.coverImagePublicId) {
    try {
      await deleteCloudinaryImage(blog.coverImagePublicId);
    } catch (error) {
      imageCleanupFailed = true;
      console.error("Failed to delete blog cover image:", error.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
    imageCleanupFailed,
  });
});

// ------------------ Get My Blogs ------------------

const getMyBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({
    author: req.user._id,
  }).populate("author", "name email");

  return res.status(200).json({
    success: true,
    message: "Blogs fetched successfully",
    totalBlogs: blogs.length,
    blogs,
  });
});

// ------------------ Get All Blogs ------------------

const getAllBlogs = asyncHandler(async (req, res) => {
  // Pagination
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const skip = (page - 1) * limit;

  const { search, category, tag, sort } = req.query;

  // Build filter
  const filter = {};

  // Search by title and content
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

  // Category filter
  if (category && category.trim()) {
    filter.category = category.trim().toLowerCase();
  }

  // Tag filter
  if (tag && tag.trim()) {
    filter.tags = tag.trim().toLowerCase();
  }

  // Dynamic sorting
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    mostLiked: { likesCount: -1, createdAt: -1 },
    leastLiked: { likesCount: 1, createdAt: -1 },
  };

  const sortBy = sortOptions[sort] || sortOptions.newest;

  // Count matching blogs
  const totalBlogs = await Blog.countDocuments(filter);

  // Fetch blogs
  const blogs = await Blog.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .populate("author", "name email");

  const totalPages = Math.ceil(totalBlogs / limit);

  return res.status(200).json({
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

// ------------------ Get Blog By ID ------------------

const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate Blog ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  const blog = await Blog.findById(id)
    .populate("author", "name email")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "name",
      },
    });

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Blog fetched successfully",
    blog,
  });
});

// ------------------ Admin Delete Blog ------------------

const deleteBlogByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate Blog ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid blog ID",
    });
  }

  const blog = await Blog.findByIdAndDelete(id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  // Delete all associated comments
  await Comment.deleteMany({
    blog: blog._id,
  });

  let imageCleanupFailed = false;

  // Delete cover image from Cloudinary
  if (blog.coverImagePublicId) {
    try {
      await deleteCloudinaryImage(blog.coverImagePublicId);
    } catch (error) {
      imageCleanupFailed = true;
      console.error("Failed to delete blog cover image:", error.message);
    }
  }

  return res.status(200).json({
    success: true,
    message: "Blog deleted successfully by admin",
    imageCleanupFailed,
  });
});

// ------------------ Toggle Blog Like ------------------

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

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  const isLiked = blog.likes.some(
    (likeId) => likeId.toString() === userId.toString(),
  );

  let updatedBlog;

  if (isLiked) {
    // Unlike
    updatedBlog = await Blog.findOneAndUpdate(
      {
        _id: id,
        likes: userId,
      },
      {
        $pull: { likes: userId },
        $inc: { likesCount: -1 },
      },
      {
        new: true,
      },
    );
  } else {
    // Like
    updatedBlog = await Blog.findOneAndUpdate(
      {
        _id: id,
        likes: { $ne: userId },
      },
      {
        $addToSet: { likes: userId },
        $inc: { likesCount: 1 },
      },
      {
        new: true,
      },
    );
  }

  if (!updatedBlog) {
    return res.status(409).json({
      success: false,
      message: "Unable to update blog like. Please try again.",
    });
  }

  return res.status(200).json({
    success: true,
    message: isLiked ? "Blog unliked successfully" : "Blog liked successfully",
    likesCount: updatedBlog.likesCount,
    isLiked: !isLiked,
  });
});

// ------------------ Exports ------------------

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getMyBlogs,
  getBlogById,
  deleteBlogByAdmin,
  toggleBlogLike,
};
