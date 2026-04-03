const express=require("express");
const cookieParser=require("cookie-parser");
const app=express();
app.use(express.json());
app.use(cookieParser());

// Import routes
const authRoutes=require("./routes/authRoutes");

// Routes
app.get("/",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"API is running..."
    })
})

app.use("/api/auth",authRoutes);

// Global error handler
app.use((err,req,res,next)=>{
    app.status(err.statusCode || 500).json({
        success:false,
        message:err.message || "Server Error",
    })
})

module.exports=app;