const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// ================== For Logged-In User =================
// Get logged-in user's profile
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "User profile fetched successfully",
    user: req.user,
  });
});



// Update logged-in user
const updateMe = asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, {
        returnDocument: "after",
        runValidators: true
    }).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message:"User not found"
        })
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role:user.role
        }
    })
})


// Delete logged-In user
const deleteMe = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.user._id)

    if (!user) {
        return res.status(404).json({
            success: false,
            message:"User not found"
        })
    }

    res.status(200).json({
        success: true,
        message:"Profile deleted successfully"
    })
})

// ===========================================================


// ======================= For Admin =========================
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

// Admin Update any user
const updateUser = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const user = await User.findById(req.params.id, { name, email }, {
        returnDocument: "after",
        runValidators: true
    }).select("-password");

    if (!user) {
        return res.status(404).json({
            success: false,
            message:"User not found"
        })
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role:user.role
        }
    })
})

// Admin delete any user
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        return res.status(200).json({
            success: false,
            message: "User not found"
        })
    }

    res.status(200).json({
        success: true,
        message:"Profile deleted successfully"
    })
})

module.exports = { getMe,updateMe,deleteMe,getAllUsers,updateUser,deleteUser};