const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    try {

        // 1. Check if token exists
        const token = req.cookies.token;

        if (!token) {
            res.status(401).json({ message: "Not authorized" });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Check if user exists
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            res.status(404).json({ message: "User not found" });
        }

        // 4. Add user to request object
        req.user = user;

        next();
        
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = protect;