const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const cookieOptions = require("../utils/cookieOptions");

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        status: false,
        message: "User already exists with this email",
      });
    }

    // 2.Create user
    const newUser = await User.create({
      name,
      email,
      password,
    });

    // 3. Generate token
    const token = generateToken(newUser._id);

    // 4. Send response
    res.cookie("token", token, cookieOptions).status(201).json({
      success: true,
      message: "User registered successfully",
        data: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
        }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;

        // 1. Check user exists
        const existingUser=await User.findOne({email}).select("+password");

        if(!existingUser){
            res.status(400).json({
                success:false,
                message:"Invalid email or password"
            })
        }

        // 2.check password
        const isMatch=await existingUser.comparePassword(password);

        if(!isMatch){
            res.status(400).json({
                success:false,
                message:"Invalid email or password"
            })
        }

        // 3. Generate token
        const token=generateToken(existingUser._id);

        // 4.Send response
        res
        .cookie("token",token,cookieOptions)
        .status(200).json({
            success:true,
            message:"Login successful"
        })
    } catch(err){
        res.status(500).json({
            success:false,
            message:"Server error",
            error:err.message
        })
    }
}

exports.logout=(req,res)=>{
    res
    .cookie("token","")
    .status(200).json({
        success:true,
        message:"Logout successful"
    })
}

