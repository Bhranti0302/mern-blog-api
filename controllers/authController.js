const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const cookieOptions = require("../utils/cookieOptions");
const User = require("../models/User");

// ================= Register =================
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExist = await User.findOne({ email });

  if (userExist) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate JWT token
  const token = generateToken(user._id);

  // Send token in cookie
  res.cookie("token", token, cookieOptions);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ================= Login =================
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Compare entered password with hashed password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  // Generate JWT token
  const token = generateToken(user._id);

  // Send token in cookie
  res.cookie("token", token, cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ================= Logout =================
const logout = asyncHandler(async (req, res) => {
  // Clear authentication cookie
  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

// ================= Exports =================
module.exports = {
  register,
  login,
  logout,
};
