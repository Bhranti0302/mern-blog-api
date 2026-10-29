const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const cookieOptions = require("../utils/cookieOptions");
const User = require("../models/User");

// Register
const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(401).json({
            success: false,
            message:"user already exists"
        })
    }

    const user = await User.create({
        name,email,password
    })

    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
        status: true,
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role:user.role
        }
    })
})

// login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        res.status(401).json({
            success: false,
            message:"Invalid email or password"
        })
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Generate Token
    const token = await generateToken(user._id);

    // 4. Send Cookie
    res.cookie("token", token, cookieOptions);

    // 5. Send Response
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
})


module.exports = {register}