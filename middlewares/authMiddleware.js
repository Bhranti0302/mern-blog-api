const jwt = require("jsonwebtoken")
const asyncHandler = require("../utils/asyncHandler")
const User = require("../models/User")

const protect = asyncHandler(async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
          success: false,
          message: "User not logged in or invalid token",
        });
    }

    try { 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.user._id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found for this token"
            })
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        })
    }
})

module.exports=protect