const User = require("../models/User");
const Blog = require("../models/Blog");
const asyncHandler = require("../utils/asyncHandler");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const cloudinary = require("../config/cloudinary");

// ================== For Logged-In User =================

// Get logged-in user's profile
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    user: req.user,
  });
});

// Upload Profile Picture
const uploadProfilePicture = asyncHandler(async (req, res) => {
  // Check if image exists
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please upload a profile picture",
    });
  }

  // Find logged-in user
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Upload new image to Cloudinary
  const uploadedImage = await uploadToCloudinary(
    req.file.buffer,
    "blog-profiles",
  );

  // Store old image public ID
  const oldPublicId = user.profilePicturePublicId;

  // Save new image details
  user.profilePicture = uploadedImage.secure_url;
  user.profilePicturePublicId = uploadedImage.public_id;

  try {
    await user.save();
  } catch (error) {
    // Delete newly uploaded image if database save fails
    await cloudinary.uploader.destroy(uploadedImage.public_id);
    throw error;
  }

  // Delete old image after successful database update
  if (oldPublicId) {
    try {
      await cloudinary.uploader.destroy(oldPublicId);
    } catch (error) {
      console.error("Old profile picture deletion failed:", error.message);
    }
  }

  res.status(200).json({
    success: true,
    message: "Profile picture uploaded successfully",
    profilePicture: user.profilePicture,
  });
});

// Update logged-in user
const updateMe = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    },
  });
});

// Delete logged-in user
const deleteMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Delete user's blogs
  await Blog.deleteMany({ author: user._id });

  // Delete profile picture from Cloudinary
  if (user.profilePicturePublicId) {
    await cloudinary.uploader.destroy(user.profilePicturePublicId);
  }

  // Delete user
  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: "Profile deleted successfully",
  });
});

// ======================= For Admin =========================

// Get all users with pagination
const getAllUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);

  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const skip = (page - 1) * limit;

  const totalUsers = await User.countDocuments();

  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    results: users.length,
    pagination: {
      currentPage: page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page < Math.ceil(totalUsers / limit),
      hasPrevPage: page > 1,
    },
    users,
  });
});

// Admin Update Any User
const updateUser = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).select("-password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    },
  });
});

// Admin Delete Any User
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Delete all blogs created by this user
  await Blog.deleteMany({ author: user._id });

  // Delete profile picture from Cloudinary
  if (user.profilePicturePublicId) {
    await cloudinary.uploader.destroy(user.profilePicturePublicId);
  }

  // Delete user
  await User.findByIdAndDelete(user._id);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = {
  getMe,
  uploadProfilePicture,
  updateMe,
  deleteMe,
  getAllUsers,
  updateUser,
  deleteUser,
};
