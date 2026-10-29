const jwt = require("jsonwebtoken")

const generateToken = async (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn:"90d"
    });
}

module.exports = generateToken;