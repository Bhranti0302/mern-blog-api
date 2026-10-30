const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// Get logged-in user's profile
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "User profile fetched successfully",
    user: req.user,
  });
});

module.exports = { getMe };
